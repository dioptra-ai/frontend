import {makeAutoObservable} from 'mobx';

class ModelStore {
    modelsById = {};

    error = null;

    constructor() {
        makeAutoObservable(this);
    }

    async initialize() {
        const res = await window.fetch('/api/ml-model');
        const models = await res.json();

        models.forEach((model) => {
            this.modelsById[model._id] = model;
        });
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
