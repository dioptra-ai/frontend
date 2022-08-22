import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';

const AsyncSegmentationFields = ({renderData}) => {
    const allSqlFilters = useAllSqlFilters();

    return (
        <Async
            fetchData={() => metricsClient('queries/segmentation-columns', {
                sql_filters: allSqlFilters
            })}
            renderData={renderData}
        />
    );
};

AsyncSegmentationFields.propTypes = {
    renderData: PropTypes.func.isRequired
};

export default setupComponent(AsyncSegmentationFields);
