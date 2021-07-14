import mongoose from 'mongoose';

import Dashboard, {Panel} from './dashboard.mjs';

const mlModelSchema = new mongoose.Schema({
    mlModelId: {
        type: String,
        unique: true // Change this uniqueness when doing multitenancy.
    },
    name: String,
    teamId: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},
    description: String,
    mlModelVersion: String,
    lastDeployed: Date,
    mlModelTier: Number,
    dashboards: [Dashboard.schema]
}, {timestamps: true});

mlModelSchema.statics.initializeCollection = async () => {

    if (!await MlModel.exists()) {
        await MlModel.initializeNew({
            mlModelId: 1,
            name: 'Credit Card Transaction Fraud Detection',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
            lastDeployed: new Date('2021-07-14T01:20:51.873Z'),
            mlModelTier: 5,
            mlModelVersion: 'V 1.01'
        });

        console.log('Credit Card Fraud model created.');
    }
};

mlModelSchema.statics.initializeNew = async (args) => {

    await MlModel.create({
        // Default model dashboards.
        dashboards: [
            new Dashboard({
                title: 'Performance Overview'
            }),
            new Dashboard({
                title: 'Performance Details',
                panels: [
                    new Panel({
                        title: 'Prediction Analysis',
                        type: Panel.types.SECTION,
                        options: {
                            children: [
                                new Panel({
                                    title: 'Online class distribution',
                                    type: Panel.types.BAR_GRAPH,
                                    options: {
                                        yAxisName: 'Count',
                                        dataSource: 'druid', // TODO: change this
                                        query: 'SELECT ...' // TODO: change this
                                    }
                                }),
                                new Panel({
                                    title: 'Offline class distribution',
                                    type: Panel.types.BAR_GRAPH,
                                    options: {
                                        yAxisName: 'Count',
                                        dataSource: 'mongo', // TODO: change this
                                        query: 'SELECT ...' // TODO: change this
                                    }
                                }),
                                new Panel({
                                    title: 'KS Test',
                                    type: Panel.types.LINE_GRAPH,
                                    options: {
                                        xAxisName: 'Time',
                                        yAxisName: 'KS Test Value',
                                        dataSource: 'druid', // TODO: change this
                                        query: 'SELECT ...' // TODO: change this
                                    }
                                })
                            ]
                        }
                    })
                ]
            }),
            new Dashboard({
                title: 'Feature Integrity'
            }),
            new Dashboard({
                title: 'Incidents & Alerts'
            })
        ],
        ...args
    });
};

const MlModel = mongoose.model('MlModel', mlModelSchema);

export default MlModel;
