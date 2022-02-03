import useStores from 'hooks/use-stores';

const useBenchmark = (benchmarkNum = 0) => {
    const {filtersStore, benchmarkStore} = useStores();
    const currentBenchmark = filtersStore.benchmarks[benchmarkNum];

    return benchmarkStore.getBenchmarkById(currentBenchmark?.['benchmark_id']);
};

export default useBenchmark;
