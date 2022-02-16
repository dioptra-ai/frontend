import {action, makeAutoObservable} from 'mobx';

class ModelStore {
    modelsById = {};

    error = null;

    static STATE_DONE = 'STATE_DONE';

    static STATE_PENDING = 'STATE_PENDING';

    static STATE_ERROR = 'STATE_ERROR';

    state = ModelStore.STATE_DONE;

    constructor() {
        makeAutoObservable(this);
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

    fetchModels() {
        this.state = ModelStore.STATE_PENDING;

        window.fetch('/api/ml-model')
            .then((res) => res.json())
            .then(action((models) => {

                models.forEach((model) => {
                    this.modelsById[model._id] = model;
                });

                this.state = ModelStore.STATE_DONE;
            })).catch(action((e) => {
                console.error(e);

                this.state = ModelStore.STATE_ERROR;
            }));
    }
}

export const modelStore = new ModelStore();
export {ModelStore};

modelStore.fetchModels();
