import {useContext} from 'react';

import stores from 'state/stores';
import useModel from 'hooks/use-model';
import appContext from 'context/app-context';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, forLiveModel, __REMOVE_ME__excludeOrgId} = {}) => {
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
            allFilters.push('dataset_id IS NULL');
        }
    } else if (isTimeEnabled) {
        allFilters.push(timeStore.sqlTimeFilter);
        allFilters.push('dataset_id IS NULL');
    }

    const allSqlFilters = allFilters.join(' AND ');

    if (forLiveModel) {

        // This is ugly. Should find a better way to do it
        const d = new Date();

        d.setDate(d.getDate() - 1);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);

        return `${allSqlFilters
            .replace(/\("dataset_id"=[^)]+\)/, '')
            .replace(/\("model_version"=[^)]+\)/, '')
            .replace(/\("benchmark_id"=[^)]+\)/, '')
            .replace(/AND(\s+AND)+/g, 'AND')
        } AND __time >= '${d.toISOString()}' AND "dataset_id" IS NULL AND "benchmark_id" IS NULL`;
    } else {

        return allSqlFilters;
    }
};

export default useAllSqlFilters;
