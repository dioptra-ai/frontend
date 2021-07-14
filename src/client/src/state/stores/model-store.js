import {makeAutoObservable} from 'mobx';

export const ModelStore = makeAutoObservable({
    activeModelId: 1,
    models: [
        {
            id: 1,
            name: 'Credit Card Transaction Fraud Detection',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            deployed: 'May 5th, 2021 at 18:30',
            incidents: 4,
            owner: 'GG Team',
            tier: 5,
            version: 'V 1.01'
        },
        {
            id: 2,
            name: 'Product Recommendation',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            deployed: 'May 5th, 2021 at 18:30',
            incidents: 4,
            owner: 'GG Team',
            tier: 5,
            version: 'V 1.01'
        }
    ],

    get activeModel() {
        const activeModel = this.models.filter((m) => m.id === this.activeModelId);

        return activeModel && activeModel.length ? activeModel[0] : {};
    }
});
