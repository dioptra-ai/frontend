import {useContext} from 'react';

import stores from 'state/stores';
import useModel from 'hooks/use-model';
import appContext from 'context/app-context';

const {filtersStore, timeStore, modelStore, authStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, forLiveModel, __REMOVE_ME__excludeOrgId} = {}) => {
    const {isTimeEnabled} = useContext(appContext);
    const {_id, mlModelId} = useModel();

    let allFilters = filtersStore.sqlFilters;

    if (!__REMOVE_ME__excludeOrgId) {
        allFilters.push(`organization_id='${_WEBPACK_DEF_OVERRIDE_ORG_ID_ || authStore.userData.activeOrganizationMembership.organization._id}'`);
    }

    if (mlModelId) {
        allFilters.push(`model_id='${mlModelId}'`);

        if (useReferenceRange) {
            allFilters.push(modelStore.getSqlReferencePeriodFilter(_id));
            // This is ugly af
            allFilters = allFilters.filter((f) => !f.match(/request_id/));
        } else if (isTimeEnabled) {
            allFilters.push(timeStore.sqlTimeFilter);
            allFilters.push('dataset_id IS NULL');
        }
    } else if (isTimeEnabled) {
        allFilters.push(timeStore.sqlTimeFilter);
        allFilters.push('dataset_id IS NULL');
    }

    if (forLiveModel) {
        // This is ugly. Should find a better way to do it
        allFilters = allFilters.filter((f) => !f.match(/(dataset_id|model_version|benchmark_id|request_id)/));

        const d = new Date();

        d.setDate(d.getDate() - 1);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);

        allFilters.push(`__time >= '${d.toISOString()}' AND "dataset_id" IS NULL AND "benchmark_id" IS NULL`);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
