import {useContext} from 'react';
import comparisonContext from 'context/comparison-context';

import stores from 'state/stores';

const useBenchmark = () => {
    const {filtersStore, benchmarkStore} = stores;
    const comparisonContextValue = useContext(comparisonContext);
    const comparisonIndex = comparisonContextValue?.index || 0;
    const currentBenchmark = filtersStore.benchmarks[comparisonIndex];

    return benchmarkStore.getBenchmarkById(currentBenchmark?.['benchmark_id']);
};

export default useBenchmark;
