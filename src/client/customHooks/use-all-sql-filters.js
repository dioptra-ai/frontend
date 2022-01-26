import {useContext} from 'react';

import stores from 'state/stores';
import useModel from 'customHooks/use-model';
import appContext from 'context/app-context';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, __REMOVE_ME__excludeOrgId} = {}) => {
    const {isTimeEnabled} = useContext(appContext);
    const {_id, mlModelId} = useModel();
    const allFilters = [
        __REMOVE_ME__excludeOrgId ? filtersStore.__RENAME_ME__sqlFilters :
            filtersStore.sqlFilters
    ];

    if (mlModelId) {
        allFilters.push(`model_id='${mlModelId}'`);

        if (useReferenceRange) {
            allFilters.push(modelStore.getSqlReferencePeriodFilter(_id));
        } else if (isTimeEnabled) {
            allFilters.push(timeStore.sqlTimeFilter);
        }
    } else if (isTimeEnabled) {
        allFilters.push(timeStore.sqlTimeFilter);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
