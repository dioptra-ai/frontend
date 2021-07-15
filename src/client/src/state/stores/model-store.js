import {makeAutoObservable} from 'mobx';

export const ModelStore = makeAutoObservable({
    models: [
        {
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
        {
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
    ],

    getModelById(id) {

        return this.models.find(({mlModelId}) => id === mlModelId);
    }
});
