import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, __REMOVE_ME__excludeOrgId} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const {mlModelId} = modelStore.getModelById(activeModelId);
    const allFilters = [
        __REMOVE_ME__excludeOrgId ? filtersStore.__RENAME_ME__sqlFilters :
            filtersStore.sqlFilters
    ];

    if (mlModelId) {
        allFilters.push(`model_id='${mlModelId}'`);

        if (useReferenceRange) {
            allFilters.push(modelStore.getSqlReferencePeriodFilter(activeModelId));
        } else {
            allFilters.push(timeStore.sqlTimeFilter);
        }
    } else {
        allFilters.push(timeStore.sqlTimeFilter);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
