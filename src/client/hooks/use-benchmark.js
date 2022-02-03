import {useContext} from 'react';
import useStores from 'hooks/use-stores';
import comparisonContext from 'context/comparison-context';

const useBenchmark = () => {
    const {filtersStore, benchmarkStore} = useStores();
    const comparisonContextValue = useContext(comparisonContext);
    const comparisonIndex = comparisonContextValue?.index || 0;
    const currentBenchmark = filtersStore.benchmarks[comparisonIndex];

    return benchmarkStore.getBenchmarkById(currentBenchmark?.['benchmark_id']);
};

export default useBenchmark;
