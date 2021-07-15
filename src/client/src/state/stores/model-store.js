import {action, makeAutoObservable} from 'mobx';

const __HARD_CODED_MONGO_INDEX = {
    '123': {
        _id: '123',
        mlModelId: '1',
        name: 'Credit Card Transaction Fraud Detection',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
        lastDeployed: 'May 5th, 2021 at 18:30',
        incidents: 4,
        team: {
            name: 'GG Team'
        },
        tier: 5,
        version: 'V 1.01'
    },
    '456': {
        _id: '456',
        mlModelId: '2',
        name: 'Product Recommendation',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
        lastDeployed: 'May 4th, 2021 at 19:30',
        incidents: 40,
        team: {
            name: 'GG Team'
        },
        tier: 3,
        version: 'V 1.02'
    }
};

class ModelStore {
    modelsById = {};

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

    fetchModels() {
        this.state = ModelStore.STATE_PENDING;

        setTimeout(action('fetchModelsSuccess', () => {

            Object.values(__HARD_CODED_MONGO_INDEX).forEach((model) => {
                this.modelsById[model._id] = model;
            });

            this.state = ModelStore.STATE_DONE;
        }), 1000);
    }

    fetchModel(id) {
        this.state = ModelStore.STATE_PENDING;

        setTimeout(action('fetchModelSuccess', () => {
            const model = __HARD_CODED_MONGO_INDEX[id];

            this.modelsById[model._id] = model;

            this.state = ModelStore.STATE_DONE;
        }), 1000);
    }
}

export const modelStore = new ModelStore();
export {ModelStore};
