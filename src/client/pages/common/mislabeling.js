import {useState} from 'react';

import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';
import Table from 'components/table';
import Modal from 'components/modal';
import {datapointIsImage, datapointIsNER, datapointIsText, datapointIsVideo} from 'helpers/datapoint';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import PreviewDetails from 'components/preview-details';
import PreviewNER from 'components/preview-ner';

const Mislabeling = () => {
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
                        <Table
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

export default Mislabeling;
