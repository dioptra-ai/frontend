import {action, makeAutoObservable} from 'mobx';
import metricsClient from 'clients/metrics';

class BenchmarkStore {
    benchmarksById = {};

    static STATE_DONE = 'STATE_DONE';

    static STATE_PENDING = 'STATE_PENDING';

    static STATE_ERROR = 'STATE_ERROR';

    state = BenchmarkStore.STATE_DONE;

    constructor() {
        makeAutoObservable(this);
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

    fetchBenchmarks() {
        this.state = BenchmarkStore.STATE_PENDING;

        metricsClient('benchmarks', null, 'get').then(action((benchmarks) => {

            benchmarks.forEach((benchmark) => {
                this.benchmarksById[benchmark.benchmark_id] = benchmark;
            });

            this.state = BenchmarkStore.STATE_DONE;
        })).catch(action((e) => {
            console.error(e);

            this.state = BenchmarkStore.STATE_ERROR;
        }));
    }
}

export const benchmarkStore = new BenchmarkStore();
export {BenchmarkStore};

benchmarkStore.fetchBenchmarks();
