import PropTypes from 'prop-types';

import Async from 'components/async';
import DatapointsViewer from 'components/datapoints-viewer';
import baseJSONClient from 'clients/base-json-client';

const DataViewer = ({datapointIds, ...rest}) => {

    return (
        <Async
            fetchData={() => baseJSONClient('/api/datapoints/_legacy-get-datapoint-events', {
                method: 'post',
                body: {datapointIds}
            })}
            renderData={(events) => (
                <DatapointsViewer datapoints={events} limit={1000} {...rest} />
            )}
            refetchOnChanged={[datapointIds]}
        />
    );
};

DataViewer.propTypes = {
    datapointIds: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default DataViewer;
