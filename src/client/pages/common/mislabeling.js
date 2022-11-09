import Async from 'components/async';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';
import PreviewImage from 'components/preview-image';
import PreviewTextClassification from 'components/preview-text-classification';
import Table from 'components/table';

const Mislabeling = () => {
    const allFilters = useAllFilters();

    return (
        <div className='my-3'>
            <Async
                fetchData={() => metricsClient('mislabeling-score', {
                    filters: allFilters
                })}
                renderData={(datapoints) => (
                    <Table
                        columns={[{
                            Header: 'Preview',
                            accessor: 'uuid',
                            disableSortBy: true,
                            Cell: ({value}) => ( // eslint-disable-line react/prop-types
                                <div className='d-flex align-items-center justify-content-center'>
                                    <div className='mr-2'>
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
                            accessor: 'mislabeling_score'
                        }]}
                        data={datapoints}
                    />
                )}
            />
        </div>
    );
};

export default Mislabeling;
