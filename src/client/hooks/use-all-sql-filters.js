import {useContext} from 'react';

import stores from 'state/stores';
import useModel from 'hooks/use-model';
import appContext from 'context/app-context';
import comparisonContext from 'context/comparison-context';

const {filtersStore, timeStore, modelStore, userStore} = stores;

const useAllSqlFilters = ({useReferenceFilters = false, forLiveModel, excludeCurrentTimeFilters, __REMOVE_ME__excludeOrgId} = {}) => {
    const {isModelView, isBenchmarkView, getAllSqlFiltersFromAppContext} = useContext(appContext);

    if (getAllSqlFiltersFromAppContext) {

        return getAllSqlFiltersFromAppContext();
    }

    const comparisonContextValue = useContext(comparisonContext);

    let allFilters = [];

    if (!__REMOVE_ME__excludeOrgId) {
        allFilters.push(`organization_id='${_WEBPACK_DEF_OVERRIDE_ORG_ID_ || userStore.userData.activeOrganizationMembership.organization._id}'`);
    }

    if (isModelView) {

        allFilters.push(...filtersStore.getModelSqlFilters(comparisonContextValue?.index));

        if (useReferenceFilters) {
            const {_id} = useModel();

            allFilters.push(modelStore.getSqlReferenceFilters(_id));
            // This is ugly af
            allFilters = allFilters.filter((f) => !f.match(/request_id/));
        } else {
            if (!excludeCurrentTimeFilters) {
                allFilters.push(timeStore.sqlTimeFilter);
            }
            allFilters.push('dataset_id IS NULL');
        }
    } else if (isBenchmarkView) {

        allFilters.push(...filtersStore.getBenchmarkSqlFilters(comparisonContextValue?.index));

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
    } else {
        allFilters.push(timeStore.sqlTimeFilter);
        allFilters.push(...filtersStore.getSqlFilters());
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
