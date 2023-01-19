import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Async from 'components/async';
import EventsViewerWithButtons from 'components/events-viewer-with-buttons';
import metricsClient from 'clients/metrics';
import {Button} from 'react-bootstrap';

const PAGE_SIZE = 100;

const DatapointsViewerWithButtons = ({filters}) => {
    const [offset, setOffset] = useState(0);

    return (
        <>
            <Async
                fetchData={async () => {
                    // Try datapoint events first.
                    const requestDatapoints = await metricsClient('select', {
                        select: '"uuid", "request_id", "image_metadata", "text_metadata", "video_metadata","text", "tags"',
                        filters: [...filters, {
                            left: 'prediction',
                            op: 'is null'
                        }, {
                            left: 'groundtruth',
                            op: 'is null'
                        }],
                        offset,
                        limit: PAGE_SIZE
                    });

                    if (requestDatapoints.length) {

                        return requestDatapoints;
                    } else {
                        // If no datapoint events, try label events.
                        return metricsClient('select', {
                            select: '"uuid", "request_id", "image_metadata", "text_metadata", "video_metadata", "text", "tags"',
                            filters,
                            offset,
                            limit: PAGE_SIZE,
                            rm_fields: ['embeddings', 'logits']
                        });
                    }
                }}
                refetchOnChanged={[JSON.stringify(filters), offset]}
                renderData={(datapoints) => <EventsViewerWithButtons samples={datapoints} />}
            />
            <Async
                spinner={false}
                fetchData={async () => {
                    const datapointsCount = await metricsClient('select', {
                        select: 'count(*)',
                        filters: [...filters, {
                            left: 'prediction',
                            op: 'is null'
                        }, {
                            left: 'groundtruth',
                            op: 'is null'
                        }]
                    });

                    if (datapointsCount[0].count) {

                        return datapointsCount[0].count;
                    } else {
                        const labelsCount = await metricsClient('select', {
                            select: 'count(*)',
                            filters
                        });

                        return labelsCount[0].count;
                    }
                }}
            >{
                    ({data: itemsCount, loading}) => (
                        <div className='d-flex justify-content-center my-5 align-items-center'>
                            <Button
                                variant='secondary'
                                disabled={offset === 0}
                                onClick={() => setOffset(offset - PAGE_SIZE)}
                            >
                        Previous
                            </Button>
                            <div className='mx-3'>
                            Showing {offset + 1} to {loading ? '...' : `${Math.min(offset + PAGE_SIZE, itemsCount)} of ${itemsCount}`}
                            </div>
                            <Button
                                variant='secondary'
                                disabled={!loading && offset + PAGE_SIZE >= itemsCount}
                                onClick={() => setOffset(offset + PAGE_SIZE)}
                            >
                        Next
                            </Button>
                        </div>
                    )
                }
            </Async>
        </>
    );
};

DatapointsViewerWithButtons.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object)
};

export default DatapointsViewerWithButtons;
