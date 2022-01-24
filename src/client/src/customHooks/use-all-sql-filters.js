import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false, __REMOVE_ME__excludeOrgId} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const {mlModelId, benchmarkType, benchmarkModel, benchmarkMlModelVersion, referencePeriod, offlineBenchmarkDatasetId} = modelStore.getModelById(activeModelId);
    const allFilters = [
        __REMOVE_ME__excludeOrgId ? filtersStore.__RENAME_ME__sqlFilters :
            filtersStore.sqlFilters
    ];
    const isBenchmarkSet = Boolean(benchmarkModel && benchmarkType && referencePeriod);

    if (useReferenceRange) {
        if (benchmarkType === 'timeframe') {
            if (isBenchmarkSet) {
                if (benchmarkModel) {
                    allFilters.push(`model_id='${benchmarkModel}'`);

                    if (referencePeriod) {
                        allFilters.push(`"__time" >= TIME_PARSE('${referencePeriod.start}') AND "__time" < TIME_PARSE('${referencePeriod.end}')`);

                        if (benchmarkMlModelVersion) {
                            allFilters.push(`model_version='${benchmarkMlModelVersion}'`);
                        }
                    }
                }
            } else {
                allFilters.push(timeStore.sqlTimeFilter);
            }
        } else if (benchmarkType === 'dataset') { // is an offline dataset
            if (isBenchmarkSet) {
                if (benchmarkModel) {
                    allFilters.push(`model_id='${benchmarkModel}'`);

                    if (benchmarkMlModelVersion) {
                        allFilters.push(`model_version='${benchmarkMlModelVersion}'`);

                        if (offlineBenchmarkDatasetId) {
                            allFilters.push(`dataset_id='${offlineBenchmarkDatasetId}'`);
                        }

                    }
                }
            }
        } else {
            allFilters.push(`model_id='${mlModelId}'`);
            allFilters.push(timeStore.sqlTimeFilter);
        }
    } else {
        if (mlModelId) {
            allFilters.push(`model_id='${mlModelId}'`);
        }
        allFilters.push(timeStore.sqlTimeFilter);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
