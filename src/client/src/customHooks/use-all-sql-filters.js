import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, __REMOVE_ME__excludeOrgId} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const {benchmarkSet, benchmarkModel, benchmarkMlModelVersion, referencePeriod} = modelStore.getModelById(activeModelId);
    const allFilters = [
        __REMOVE_ME__excludeOrgId ? filtersStore.__RENAME_ME__sqlFilters :
            filtersStore.sqlFilters
    ];

    // console.log(benchmarkSet);
    // console.log(benchmarkModel);
    // console.log(benchmarkMlModelVersion);
    // console.log(benchmarkType);
    // console.log(referencePeriod);

    // if (mlModelId) {
    //     allFilters.push(`model_id='${mlModelId}'`);

    //     if (useReferenceRange) {
    //         allFilters.push(modelStore.getSqlReferencePeriodFilter(activeModelId));
    //     } else {
    //         allFilters.push(timeStore.sqlTimeFilter);
    //     }
    // } else {
    //     allFilters.push(timeStore.sqlTimeFilter);
    // }
    if (benchmarkSet) {
        if (benchmarkModel) {
            allFilters.push(`model_id='${benchmarkModel}'`);

            if (useReferenceRange && referencePeriod) {
                allFilters.push(`"__time" >= TIME_PARSE('${referencePeriod.start}') AND "__time" < TIME_PARSE('${referencePeriod.end}')`);

                if (benchmarkMlModelVersion) {
                    allFilters.push(`model_version='${benchmarkMlModelVersion}'`);
                }
            }
        } else { // Its an offline dataset
            console.log('offline dataset');
        }
    } else {
        allFilters.push(timeStore.sqlTimeFilter);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
