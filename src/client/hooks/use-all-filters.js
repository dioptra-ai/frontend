import {useContext} from 'react';

import stores from 'state/stores';
import appContext from 'context/app-context';
import comparisonContext from 'context/comparison-context';

const {filtersStore, timeStore} = stores;

const useAllFilters = () => {
    const {isModelView} = useContext(appContext);
    const comparisonContextValue = useContext(comparisonContext);

    const allFilters = [];

    if (isModelView) {

        allFilters.push(filtersStore.getModelFilters(comparisonContextValue?.index));
    }

    allFilters.push(timeStore.timeFilter);
    allFilters.push(...filtersStore.filters);

    return allFilters;
};

export default useAllFilters;
