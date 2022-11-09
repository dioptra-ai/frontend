import PropTypes from 'prop-types';
import {useState} from 'react';

import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsCartPlus, BsHandThumbsDown, BsPatchCheck} from 'react-icons/bs';
import {AiOutlineDelete} from 'react-icons/ai';

import Table from 'components/table';
import Modal from 'components/modal';
import {datapointIsImage, datapointIsNER, datapointIsText, datapointIsVideo} from 'helpers/datapoint';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import PreviewDetails from 'components/preview-details';
import PreviewNER from 'components/preview-ner';
import {setupComponent} from 'helpers/component-helper';

const Mislabeling = ({userStore}) => {
    const allFilters = useAllFilters();
    const [exampleUUIDInModal, setExampleUUIDInModal] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const limit = 1000;

    return (
        <>
            <div className='text-dark m-3 bold-text d-flex justify-content-between'>
                <div>
                    Total: {selectedRows.length >= limit ? `${limit.toLocaleString()}+` : selectedRows.length.toLocaleString()}
                </div>
                <div className='d-flex'>
                    <OverlayTrigger overlay={<Tooltip>Add {selectedRows.length} to Data Cart</Tooltip>}>
                        <button
                            disabled={!selectedRows.length}
                            className='d-flex text-dark border-0 bg-transparent click-down fs-2' onClick={() => {

                                userStore.tryUpdate({
                                    cart: userStore.userData.cart.concat(...selectedRows.map(({uuid}) => uuid))
                                });
                            }}>
                            <BsCartPlus className='fs-2 ps-2 cursor-pointer' />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Accept {selectedRows.length} Suggested Label(s)</Tooltip>}>
                        <button
                            disabled={!selectedRows.length}
                            className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                        >
                            <BsPatchCheck className='fs-2 ps-2 cursor-pointer' />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Reject {selectedRows.length} Suggested Label(s)</Tooltip>}>
                        <button
                            disabled={!selectedRows.length}
                            className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                        >
                            <BsHandThumbsDown className='fs-2 ps-2 cursor-pointer' />
                        </button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Delete {selectedRows.length} Datapoint(s)</Tooltip>}>
                        <button
                            disabled={!selectedRows.length}
                            className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                        >
                            <AiOutlineDelete className='fs-2 ps-2 cursor-pointer' />
                        </button>
                    </OverlayTrigger>
                </div>
            </div>
            <div className='my-3'>
                <Async
                    fetchData={() => metricsClient('mislabeling-score', {
                        filters: allFilters
                    })}
                    refetchOnChanged={[JSON.stringify(allFilters)]}
                    renderData={(datapoints) => (
                        <Table
                            onSelectedRowsChange={setSelectedRows}
                            columns={[{
                                Header: 'Preview',
                                accessor: 'uuid',
                                disableSortBy: true,
                                Cell: ({value}) => ( // eslint-disable-line react/prop-types
                                    <div className='d-flex align-items-center justify-content-center'>
                                        <div className='my-2 cursor-pointer' onClick={() => setExampleUUIDInModal(value)}>
                                            <Async
                                                fetchData={() => metricsClient('select', {
                                                    select: '"uuid", "image_metadata", "text_metadata", "video_metadata"',
                                                    filters: [{
                                                        left: 'uuid',
                                                        op: '==',
                                                        right: value
                                                    }]
                                                })}
                                                renderData={(datapoints) => {
                                                    const {image_metadata, text_metadata, video_metadata} = datapoints[0];

                                                    if (image_metadata || video_metadata) {

                                                        return <PreviewImage datapoint={datapoints[0]} maxHeight={100}/>;
                                                    } else if (text_metadata) {

                                                        return <PreviewTextClassification sample={datapoints[0]}/>;
                                                    } else {

                                                        return <div>N/A</div>;
                                                    }
                                                }}
                                                refetchOnChanged={[value]}
                                            />
                                        </div>
                                    </div>
                                )
                            }, {
                                Header: 'Ground Truth Label',
                                accessor: 'groundtruth'
                            }, {
                                Header: 'Suggested Label',
                                accessor: 'prediction'
                            }, {
                                Header: 'Mislabeling Score',
                                accessor: 'mislabeling_score',
                                sortType: 'basic'
                            }]}
                            data={datapoints}
                        />
                    )}
                />
            </div>
            {exampleUUIDInModal && (
                <Modal isOpen={true} onClose={() => setExampleUUIDInModal(null)}>
                    <Async
                        fetchData={() => metricsClient('select', {
                            select: '"uuid", "groundtruth", prediction, "image_metadata", "text", "request_id", "tags"',
                            filters: [{
                                left: 'uuid',
                                op: '=',
                                right: exampleUUIDInModal
                            }]
                        })}
                        renderData={([datapoint]) => {
                            const detailsComponent = (
                                <>
                                    <hr/>
                                    <PreviewDetails sample={datapoint}/>
                                </>
                            );

                            if (datapointIsImage(datapoint) || datapointIsVideo(datapoint)) {
                                return (

                                    <>
                                        <PreviewImage
                                            datapoint={datapoint}
                                            videoControls
                                            maxHeight={600}
                                            zoomable
                                        />
                                        {detailsComponent}
                                    </>
                                );
                            } else if (datapointIsText(datapoint)) {
                                return (
                                    <>
                                        <PreviewTextClassification sample={datapoint} />
                                        {detailsComponent}
                                    </>
                                );
                            } else if (datapointIsNER(datapoint)) {
                                return (
                                    <>
                                        <PreviewNER sample={datapoint} />
                                        {detailsComponent}
                                    </>
                                );
                            } else {
                                return null;
                            }
                        }}
                        refetchOnChanged={[exampleUUIDInModal]}
                    />
                </Modal>
            )}
        </>
    );
};

Mislabeling.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Mislabeling);
