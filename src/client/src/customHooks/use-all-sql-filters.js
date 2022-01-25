import {useParams} from 'react-router-dom';

import stores from 'state/stores';
import useModel from 'customHooks/use-model';

const {filtersStore, timeStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, __REMOVE_ME__excludeOrgId} = {}) => {
    const {_id, mlModelId, benchmarkType, benchmarkModel, benchmarkMlModelVersion, referencePeriod, offlineBenchmarkDatasetId} = useModel();
    const allFilters = [
        __REMOVE_ME__excludeOrgId ? filtersStore.__RENAME_ME__sqlFilters :
            filtersStore.sqlFilters
    ];

    if (mlModelId) {
        allFilters.push(`model_id='${mlModelId}'`);

        if (useReferenceRange) {
            allFilters.push(modelStore.getSqlReferencePeriodFilter(_id));
        } else {
            allFilters.push(timeStore.sqlTimeFilter);
        }
    } else {
        allFilters.push(timeStore.sqlTimeFilter);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
