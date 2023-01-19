import PropTypes from 'prop-types';

import Async from 'components/async';
import EventsViewerWithButtons from 'components/events-viewer-with-buttons';
import metricsClient from 'clients/metrics';

const DatapointsViewerWithButtons = ({filters, limit = 1000}) => {

    return (
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
                    limit
                });

                if (requestDatapoints.length) {

                    return requestDatapoints;
                } else {
                    // If no datapoint events, try label events.
                    return metricsClient('select', {
                        select: '"uuid", "request_id", "image_metadata", "text_metadata", "video_metadata", "text", "tags"',
                        filters, limit,
                        rm_fields: ['embeddings', 'logits']
                    });
                }
            }}
            renderData={(datapoints) => <EventsViewerWithButtons samples={datapoints} limit={limit} />}
            refetchOnChanged={[JSON.stringify(filters)]}
        />
    );
};

DatapointsViewerWithButtons.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    limit: PropTypes.number
};

export default DatapointsViewerWithButtons;
