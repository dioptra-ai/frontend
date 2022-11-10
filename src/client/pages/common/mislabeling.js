/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';

import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsCartPlus, BsCommand, BsHandThumbsDown, BsPatchCheck} from 'react-icons/bs';
import {AiOutlineDelete} from 'react-icons/ai';
import {TbLetterA, TbLetterD, TbLetterS} from 'react-icons/tb';

import Table from 'components/table';
import Modal from 'components/modal';
import {datapointIsImage, datapointIsNER, datapointIsText, datapointIsVideo} from 'helpers/datapoint';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import PreviewDetails from 'components/preview-details';
import PreviewNER from 'components/preview-ner';
import {setupComponent} from 'helpers/component-helper';

const FakeStatefulMislabeling = ({initialDatapoints, userStore, setExampleUUIDInModal}) => {
    const [datapoints, setDatapoints] = useState(initialDatapoints);
    const [selectedRows, setSelectedRows] = useState([]);

    const handleKeyPress = (event) => {
        console.log(event.key, event.ctrlKey);

        if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            setDatapoints(datapoints.filter((d) => d['uuid'] !== datapoints[0]['uuid']));
        } else if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            setDatapoints(datapoints.filter((d) => d['uuid'] !== datapoints[0]['uuid']));
        } else if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            setDatapoints(datapoints.filter((d) => d['uuid'] !== datapoints[0]['uuid']));
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [datapoints]);

    return (
        <>
            <div className='text-dark m-3 bold-text d-flex justify-content-between'>
                <div>
                    Total: {datapoints.length.toLocaleString()}
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
            <Table
                onSelectedRowsChange={setSelectedRows}
                columns={[{
                    Header: 'Preview',
                    accessor: 'uuid',
                    disableSortBy: true,
                    width: '25%',
                    Cell: ({row}) => { // eslint-disable-line react/prop-types
                        const {uuid} = row.original; // eslint-disable-line react/prop-types

                        return (
                            <div className='d-flex align-items-center justify-content-center'>
                                <div className='my-2 cursor-pointer' onClick={() => setExampleUUIDInModal(uuid)}>
                                    {
                                        (datapointIsImage(row.original) || datapointIsVideo(row.original)) ? (
                                            <PreviewImage datapoint={row.original} maxHeight={200} />
                                        ) : datapointIsText(row.original) ? (
                                            <PreviewTextClassification sample={row.original} />
                                        ) : null
                                    }
                                </div>
                            </div>
                        );
                    }
                }, {
                    Header: 'Ground Truth Label',
                    // eslint-disable-next-line react/prop-types
                    Cell: ({row}) => row.original['groundtruth']['class_name']
                }, {
                    Header: 'Suggested Label',
                    // eslint-disable-next-line react/prop-types
                    Cell: ({row}) => row.original['prediction']['class_name']
                }, {
                    Header: 'Mislabeling Score',
                    accessor: 'mislabeling_score',
                    sortType: 'basic',
                    // eslint-disable-next-line react/prop-types
                    Cell: ({row}) => Number(row.original.mislabeling_score).toFixed(2)
                }, {
                    Header: '',
                    disableSortBy: true,
                    id: 'actions',
                    width: '25%',
                    Cell: ({row}) => ( // eslint-disable-line react/prop-types
                        <div className='d-flex justify-content-end flex-column align-items-center'>
                            <div className='d-flex align-items-center pb-1 mb-1' style={{
                                borderBottom: '1px solid #e0e0e0'
                            }}>
                                <OverlayTrigger overlay={<Tooltip>Add to Data Cart</Tooltip>}>
                                    <button
                                        className='d-flex text-dark border-0 bg-transparent click-down fs-2' onClick={() => {

                                            userStore.tryUpdate({
                                            // eslint-disable-next-line react/prop-types
                                                cart: userStore.userData.cart.concat(row.original.uuid)
                                            });
                                        }}>
                                        <BsCartPlus className='fs-2 ps-2 cursor-pointer' />
                                    </button>
                                </OverlayTrigger>
                                <OverlayTrigger overlay={<Tooltip>Delete Datapoint</Tooltip>}>
                                    <div className='d-flex flex-column align-items-center'>
                                        <button
                                            onClick={() => setDatapoints(datapoints.filter(({uuid}) => uuid !== row.original.uuid))} className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                                        >
                                            <AiOutlineDelete className='fs-2 ps-2 cursor-pointer' />
                                        </button>
                                        {
                                            row.index === 0 ? (

                                                <div className='text-secondary d-flex'>
                                                    <BsCommand />
                                                    <TbLetterD />
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                </OverlayTrigger>
                            </div>
                            <div className='d-flex align-items-center flex-column'>
                                {
                                    row.index === 0 ? (
                                        <div className='text-secondary d-flex'>
                                            Accept Suggestion?
                                        </div>
                                    ) : null
                                }
                                <div className='d-flex align-items-center'>
                                    <OverlayTrigger overlay={<Tooltip>Accept Suggested Label</Tooltip>}>
                                        <div className='d-flex flex-column align-items-center'>
                                            <button
                                                onClick={() => setDatapoints(datapoints.filter(({uuid}) => uuid !== row.original.uuid))}
                                                className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                                            >
                                                <BsPatchCheck className='fs-2 ps-2 cursor-pointer' />
                                            </button>
                                            {
                                                row.index === 0 ? (

                                                    <div className='text-secondary d-flex'>
                                                        <BsCommand />
                                                        <TbLetterA />
                                                    </div>
                                                ) : null
                                            }
                                        </div>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Reject Suggested Label</Tooltip>}>
                                        <div className='d-flex flex-column align-items-center'>
                                            <button
                                                onClick={() => setDatapoints(datapoints.filter(({uuid}) => uuid !== row.original.uuid))}
                                                className='d-flex text-dark border-0 bg-transparent click-down fs-2'
                                            >
                                                <BsHandThumbsDown className='fs-2 ps-2 cursor-pointer' />
                                            </button>
                                            {
                                                row.index === 0 ? (

                                                    <div className='text-secondary d-flex'>
                                                        <BsCommand />
                                                        <TbLetterS />
                                                    </div>
                                                ) : null
                                            }
                                        </div>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </div>
                    )
                }]}
                data={datapoints}
            />
        </>
    );
};

FakeStatefulMislabeling.propTypes = {
    initialDatapoints: PropTypes.any,
    setExampleUUIDInModal: PropTypes.func,
    userStore: PropTypes.object.isRequired
};

const Mislabeling = ({userStore}) => {
    const allFilters = useAllFilters();
    const [exampleUUIDInModal, setExampleUUIDInModal] = useState(null);

    return (
        <>
            <div className='my-3'>
                <Async
                    fetchData={() => metricsClient('mislabeling-score', {
                        filters: allFilters
                    })}
                    refetchOnChanged={[JSON.stringify(allFilters)]}
                    renderData={(datapoints) => (
                        <FakeStatefulMislabeling initialDatapoints={datapoints} userStore={userStore} setExampleUUIDInModal={setExampleUUIDInModal}/>
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
