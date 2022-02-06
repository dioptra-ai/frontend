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

    getSqlReferencePeriodFilter(_id) {
        const {referencePeriod} = this.modelsById[_id];

        return referencePeriod ? `"__time" >= TIME_PARSE('${referencePeriod.start}') AND "__time" < TIME_PARSE('${referencePeriod.end}')` : 'TRUE';
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
