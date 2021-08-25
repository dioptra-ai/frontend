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

    setModelById(_id, data) {
        this.modelsById[_id] = data;
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

    fetchModel(_id) {

        if (!this.modelsById[_id]) {
            this.state = ModelStore.STATE_PENDING;

            window.fetch(`/api/ml-model/${_id}`)
                .then((res) => res.json())
                .then(action((model) => {

                    this.modelsById[model._id] = model;

                    this.state = ModelStore.STATE_DONE;
                })).catch(action((e) => {
                    console.error(e);

                    this.state = ModelStore.STATE_ERROR;
                }));
        }
    }
}

export const modelStore = new ModelStore();
export {ModelStore};
