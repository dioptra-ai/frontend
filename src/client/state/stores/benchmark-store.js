import {makeAutoObservable} from 'mobx';
import metricsClient from 'clients/metrics';

class BenchmarkStore {
    benchmarksById = {};

    constructor() {
        makeAutoObservable(this);
    }

    async fetchBenchmarks () {
        try {
            const benchmarks = await metricsClient('benchmarks', null, 'get');

            benchmarks.forEach((benchmark) => {
                this.benchmarksById[benchmark.benchmark_id] = benchmark;
            });
        } catch (e) {
            console.warn(e);
        }
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
