import {makeAutoObservable} from 'mobx';
import baseJSONClient from 'clients/base-json-client';

class ModelStore {
    modelsById = {};

    error = null;

    constructor() {
        makeAutoObservable(this);
    }

    async fetchModels() {
        try {
            const models = await baseJSONClient('/api/ml-model');

            models.forEach((model) => {
                this.modelsById[model._id] = model;
            });
        } catch (e) {
            console.warn(e);
        }

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

    getSqlReferenceFilters(_id) {
        const {referencePeriod, referenceBenchmarkId} = this.modelsById[_id];

        if (referenceBenchmarkId) {

            return `benchmark_id = '${referenceBenchmarkId}'`;
        } else if (referencePeriod) {

            return `"__time" >= TIME_PARSE('${referencePeriod.start}') AND "__time" < TIME_PARSE('${referencePeriod.end}') AND benchmark_id IS NULL AND dataset_id IS NULL`;
        } else {

            return 'benchmark_id IS NULL AND dataset_id IS NULL';
        }
    }
}

export const modelStore = new ModelStore();
export {ModelStore};
