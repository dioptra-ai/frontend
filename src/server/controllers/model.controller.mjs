import express from 'express';
import {Model} from '../models/model.model.mjs';
import {distance} from 'mathjs';
import {unionMerge} from '../common/utils.mjs';
import {DruidClient} from '../common/druid.mjs';

const ModelRouter = express.Router();
const client = new DruidClient(process.env.TIME_SERIES_DB);

// eslint-disable-next-line no-unused-vars
ModelRouter.get('/', async function (req, res, next) {
    // TODO filter only models that belong to authenticated user when passport integration is merged
    const models = await Model.find();

    // TODO seed first model temporarily
    if (models.length === 0) {
        const modelData = {
            name: 'credit_card_fraud_detection',
            display: 'Credit Card Fraud Detection',
            offlineClassDistribution: [{
                name: 'fraudulent', value: '0.14'
            }, {
                name: 'human_review', value: '0.32'
            }, {
                name: 'non_fraudulent', value: '0.56'
            }, {
                name: 'test', value: '0.4'
            }]
        };
        const model = await Model(modelData).save();

        models.push(model);
    }

    res.send(models);
});

// eslint-disable-next-line no-unused-vars
ModelRouter.put('/:model/offlineClassDistribution/', async function(req, res, next) {
    const model = await Model.findById(req.params.model);

    if (!model) {
        return res.status(422).send({error: 'invalid_model_id'});
    }

    for (const entry in req.body) {
        const classItem = model.offlineClassDistribution.find((item) => item.name === entry);

        classItem.value = req.body[entry];
    }

    await model.save();

    return res.send(model);
});

// eslint-disable-next-line no-unused-vars
ModelRouter.get('/:model/performanceDetails/', async function (req, res, next) {
    const model = await Model.findById(req.params.model);

    if (!model) {
        return res.status(422).send({error: 'invalid_model_id'});
    }

    const fromDate = new Date(req.query.from);

    if (!fromDate) {
        return res.status(422).send({error: 'invalid_date_range_from'});
    }

    const toDate = new Date(req.query.to);

    if (!toDate) {
        return res.status(422).send({error: 'invalid_date_range_to'});
    }

    const period = req.query.period ?? 'MINUTE';

    if (!['SECOND', 'MINUTE', 'HOUR'].includes(period)) {
        return res.status(422).send({error: 'invalid_period_type'});
    }

    if (fromDate >= toDate || (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24) > 30) {
        return res.status(422).send({error: 'invalid_date_range'});
    }

    const from = fromDate.toISOString().replace('Z', '').replace('T', ' ');
    const to = toDate.toISOString().replace('Z', '').replace('T', ' ');

    const averagesData = await client.getOnlineClassDistribution(model.name, from, to);

    const seriesData = await client.getTimeSeriesClassDistribution(model.name, from, to, period);

    const result = {
        model: model.name,
        onlineClassDistribution: averagesData.map((item) => ({name: item.prediction, value: item.my_percentage})),
        offlineClassDistribution: model.offlineClassDistribution,
        ksTest: []
    };

    const seriesDataMapByTime = new Map();

    seriesData.forEach((dataPoint) => {
        const dataPointGroup = seriesDataMapByTime.get(dataPoint.time);

        if (!dataPointGroup) {
            seriesDataMapByTime.set(dataPoint.time, [dataPoint]);
        } else {
            dataPointGroup.push(dataPoint);
        }
    });

    seriesDataMapByTime.forEach((dataPointGroup, time) => {
        const merged = unionMerge(result.offlineClassDistribution, dataPointGroup, {
            key1Selector: (item) => item.name,
            key2Selector: (item) => item.prediction
        });

        const offlineDataVector = [],
            timePointDataVector = [];

        merged.forEach((mergedItem) => {
            offlineDataVector.push(mergedItem.values[0]);
            timePointDataVector.push(mergedItem.values[1]);
        });

        const value = distance(offlineDataVector, timePointDataVector);

        result.ksTest.push({time: new Date(time), value});
    });

    return res.send(result);
});

export default ModelRouter;
