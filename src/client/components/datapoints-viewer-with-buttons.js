import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';

import Async from 'components/async';
import EventsViewerWithButtons from 'components/events-viewer-with-buttons';
import baseJSONClient from 'clients/base-json-client';

const PAGE_SIZE = 100;

const DatapointsViewerWithButtons = ({filters}) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        setOffset(0);
    }, [filters]);

    return (
        <>
            <Async
                fetchData={() => baseJSONClient.post('api/datapoints/select', {
                    select: ['metadata', 'type', 'tags.*', 'predictions.*'],
                    filters,
                    offset,
                    limit: PAGE_SIZE
                })}
                refetchOnChanged={[JSON.stringify(filters), offset]}
                renderData={(datapoints) => <EventsViewerWithButtons samples={datapoints} />}
            />
            <Async
                spinner={false}
                fetchData={() => baseJSONClient.post('api/datapoints/select', {
                    select: ['* FROM datapoints where false; Select 1; SELECT *'],
                    filters
                })}
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
                            Showing {Number(offset + 1).toLocaleString()} to {loading ? '...' : `${Math.min(offset + PAGE_SIZE, itemsCount).toLocaleString()} of ${Number(itemsCount).toLocaleString()}`}
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
