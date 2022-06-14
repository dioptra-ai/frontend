import {makeAutoObservable} from 'mobx';
import metricsClient from 'clients/metrics';

class BenchmarkStore {
    benchmarksById = {};

    constructor() {
        makeAutoObservable(this);
    }

    fetchBenchmarks() {
        metricsClient('benchmarks').then((benchmarks) => {

            benchmarks.forEach((benchmark) => {
                this.benchmarksById[benchmark.benchmark_id] = benchmark;
            });
        });
    }

    get benchmarks() {

        return Object.values(this.benchmarksById);
    }

    getBenchmarkById(_id) {

        return this.benchmarksById[_id];
    }

    setBenchmarkById(_id, data) {
        this.benchmarksById[_id] = data;
    }
}

export const benchmarkStore = new BenchmarkStore();
export {BenchmarkStore};
