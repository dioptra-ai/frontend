import {makeAutoObservable, runInAction} from 'mobx';
import baseJSONClient from 'clients/base-json-client';

class ModelStore {
    modelsById = {};

    error = null;

    constructor() {
        makeAutoObservable(this);
    }

    initialize() {
        // Not waiting on the result.
        this.tryFetchModels();
    }

    get models() {

        return Object.values(this.modelsById);
    }

    getModelById(_id) {

        return this.modelsById[_id];
    }

    getModelByMlModelId(mlModelId) {

        return this.models.find((m) => m.mlModelId === mlModelId);
    }

    setModelById(_id, data) {
        this.modelsById[_id] = data;
    }

    getReferenceFilters(_id) {
        const {referencePeriod, referenceBenchmarkId} = this.modelsById[_id];

        if (referenceBenchmarkId) {

            return {
                left: 'benchmark_id',
                op: '=',
                right: referenceBenchmarkId
            };
        } else if (referencePeriod) {

            return {
                left: {
                    left: {
                        left: 'timestamp',
                        op: '>=',
                        right: referencePeriod.start
                    },
                    op: 'and',
                    right: {
                        left: 'timestamp',
                        op: '<',
                        right: referencePeriod.end
                    }
                },
                op: 'and',
                right: {
                    left: {
                        left: 'benchmark_id',
                        op: 'is',
                        right: null
                    },
                    op: 'and',
                    right: {
                        left: 'dataset_id',
                        op: 'is',
                        right: null
                    }
                }
            };
        } else {

            return {
                left: {
                    left: 'benchmark_id',
                    op: 'is',
                    right: null
                },
                op: 'and',
                right: {
                    left: 'dataset_id',
                    op: 'is',
                    right: null
                }
            };
        }
    }


    getSqlReferenceFilters(_id) {
        const {referencePeriod, referenceBenchmarkId} = this.modelsById[_id];

        if (referenceBenchmarkId) {

            return `benchmark_id = '${referenceBenchmarkId}'`;
        } else if (referencePeriod) {

            return `"timestamp" >= TIMESTAMPTZ('${referencePeriod.start}') AND "timestamp" < TIMESTAMPTZ('${referencePeriod.end}') AND benchmark_id IS NULL AND dataset_id IS NULL`;
        } else {

            return 'benchmark_id IS NULL AND dataset_id IS NULL';
        }
    }

    async tryFetchModels() {
        try {
            const models = await baseJSONClient('/api/ml-model');

            runInAction(() => {
                this.modelsById = models.reduce((agg, m) => ({
                    ...agg,
                    [m._id]: m
                }), {});
            });
        } catch (e) {
            console.warn(e);
        }
    }

    async tryDeleteModel(_id) {
        await baseJSONClient(`/api/ml-model/${_id}`, {method: 'delete'});
        await this.tryFetchModels();
    }
}

export const modelStore = new ModelStore();
export {ModelStore};
