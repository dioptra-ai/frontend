import express from 'express';
import {MLModel} from '../models/ml-model.mjs';
import {distance} from 'mathjs';
import {unionMerge} from '../common/utils.mjs';
import _ from 'lodash';
import {DruidClient} from '../common/druid.mjs';

const MLModelRouter = express.Router();
const client = new DruidClient();

// eslint-disable-next-line no-unused-vars
MLModelRouter.get('/', async function (req, res, next) {
    // TODO filter only models that belong to authenticated user when passport integration is merged
    const models = await MLModel.find();

    res.send(models);
});

// eslint-disable-next-line no-unused-vars
MLModelRouter.put('/:model/offline-class-distribution/', async function(req, res, next) {
    try {
        const model = await MLModel.findById(req.params.model);

        if (!model) {
            return res.status(422).send({error: 'invalid_model_id'});
        }

        const total = _.sum(req.body.map((item) => item.value));

        model.offlineClassDistribution = req.body.map((item) => ({name: item.name, value: item.value / total}));

        await model.save();

        return res.send(model);
    } catch (err) {
        return next(err);
    }
});

// eslint-disable-next-line no-unused-vars
MLModelRouter.get('/:model/performance-details/', async function (req, res, next) {
    try {
        const model = await MLModel.findById(req.params.model);

        if (!model) {
            return res.status(422).send({error: 'invalid_model_id'});
        }

        const fromDate = new Date(req.query.from);
        const toDate = new Date(req.query.to);
        const period = req.query.period ?? 'MINUTE';

        if (!['SECOND', 'MINUTE', 'HOUR'].includes(period)) {
            return res.status(422).send({error: 'invalid_period_type'});
        }

        if (fromDate >= toDate || (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24) > (process.env.TIME_SERIES_RANGE_MAX_DAYS ?? 30)) {
            return res.status(422).send({error: 'invalid_date_range'});
        }

        const from = fromDate.toISOString().replace('Z', '').replace('T', ' ');
        const to = toDate.toISOString().replace('Z', '').replace('T', ' ');

        const distributionData = await client.getOnlineClassDistribution(model.name, 'prediction', from, to);

        const seriesData = await client.getTimeSeriesClassDistribution(model.name, 'prediction', from, to, period);

        const result = {
            model: model.name,
            onlineClassDistribution: distributionData.map((item) => ({name: item.prediction, value: item.my_percentage})),
            offlineClassDistribution: model.offlineClassDistribution,
            distance: []
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

            result.distance.push({time: new Date(time), value});
        });

        return res.send(result);
    } catch (err) {
        return next(err);
    }
});

export default MLModelRouter;
