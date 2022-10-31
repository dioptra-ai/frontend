import {useContext} from 'react';

import stores from 'state/stores';
import useModel from 'hooks/use-model';
import appContext from 'context/app-context';
import comparisonContext from 'context/comparison-context';

const {filtersStore, timeStore, modelStore} = stores;

const useAllFilters = ({useReferenceFilters = false, excludeCurrentTimeFilters} = {}) => {
    const {isModelView} = useContext(appContext);
    const comparisonContextValue = useContext(comparisonContext);

    let allFilters = [];

    if (isModelView) {

        allFilters.push(filtersStore.getModelFilters(comparisonContextValue?.index));

        if (useReferenceFilters) {
            const {_id} = useModel();

            allFilters.push(modelStore.getReferenceFilters(_id));
            // This is wrong, we need to deep search.
            allFilters = allFilters.filter((f) => !String(f['left']).match(/request_id/));
        } else {
            if (!excludeCurrentTimeFilters) {
                allFilters.push(timeStore.timeFilter);
            }
            allFilters.push({
                left: 'dataset_id',
                op: 'is',
                right: null
            });
        }
    }

    allFilters.push(timeStore.timeFilter);
    allFilters.push(...filtersStore.filters);

    return allFilters;
};

export default useAllFilters;
