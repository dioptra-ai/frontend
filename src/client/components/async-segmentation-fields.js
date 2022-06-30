import {useContext} from 'react';
import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';
import useModel from 'hooks/use-model';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';
import appContext from 'context/app-context';

const AsyncSegmentationFields = ({timeStore, renderData}) => {
    const model = useModel();
    const allSqlFilters = useAllSqlFilters();
    const {isModelView} = useContext(appContext);

    return (
        <Async
            fetchData={() => metricsClient('queries/fairness-bias-columns-counts', {
                sql_filters: isModelView ? timeStore.sqlTimeFilter : allSqlFilters,
                ml_model_id: model?.mlModelId,
                model_type: model?.mlModelType
            })}
            renderData={renderData}
        />
    );
};

AsyncSegmentationFields.propTypes = {
    timeStore: PropTypes.object.isRequired,
    renderData: PropTypes.func.isRequired
};

export default setupComponent(AsyncSegmentationFields);
