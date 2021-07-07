import express from 'express';
import {Model} from '../models/model.model.mjs';
import fetch from 'node-fetch';
import {distance} from 'mathjs';

const ModelRouter = express.Router();

// eslint-disable-next-line no-unused-vars
ModelRouter.get('/', async function (req, res, next) {
    // TODO filter only models that belong to authenticated user when passport integration is merged
    const models = await Model.find();

    // TODO seed first model temporarily
    if (models.length === 0) {
        const modelData = {
            name: 'credit_card_fraud_detection',
            display: 'Credit Card Fraud Detection',
            offlineClassDistribution: {
                fraudulent: 0.1,
                nonFraudulent: 0.5,
                humanReview: 0.4
            }
        };
        const model = await Model(modelData).save();

        models.push(model);
    }

    res.send(models);
});

// eslint-disable-next-line no-unused-vars
ModelRouter.get('/:model/performanceDetails/', async function (req, res, next) {
    const model = await Model.findById(req.params.model);

    if (!model) {
        return res.status(422).send({error: 'invalid_model_id'});
    }
    if (!req.query.from) {
        return res.status(422).send({error: 'invalid_date_range_from'});
    }

    if (!req.query.to) {
        return res.status(422).send({error: 'invalid_date_range_to'});
    }

    const period = req.query.period ?? 'MINUTE';

    if (!['SECOND', 'MINUTE', 'HOUR'].includes(period)) {
        return res.status(422).send({error: 'invalid_period_type'});
    }

    // TODO check if we need to add some date range constraints

    const from = new Date(req.query.from).toISOString().replace('Z', '').replace('T', ' ');
    const to = new Date(req.query.to).toISOString().replace('Z', '').replace('T', ' ');

    const averagesQuery = `select cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage, 
            my_table.prediction
        from (
            SELECT count(*) as my_count, prediction, 1 as join_key
            FROM "dioptra-gt-combined-eventstream"
            WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
            AND model_id = '${model.name}'
            GROUP BY 2
        ) as my_table
        join (
            SELECT count(*) as total_count, 1 as join_key
            FROM "dioptra-gt-combined-eventstream"
            WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
            AND model_id = '${model.name}'
        ) as my_count_table
        on my_table.join_key = my_count_table.join_key`;
    const averagesResult = await fetch(`${process.env.TIME_SERIES_DB}/druid/v2/sql/`, {
        method: 'post',
        body: JSON.stringify({query: averagesQuery}),
        headers: {'Content-Type': 'application/json'}
    });
    const averagesData = await averagesResult.json();
    // TODO what if we don't have all three class distributions, for example for period: 2021-06-25 18:15:57.582 - 2021-06-25 20:15:57.582

    const seriesQuery = `select my_table.my_time as "time", cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as "value", 
            my_table.prediction
        from (
            SELECT floor(__time to ${period}) as my_time, count(1) as my_count, prediction
            FROM "dioptra-gt-combined-eventstream"
            WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
            AND model_id = '${model.name}'
            GROUP BY 1, 3
        ) as my_table
        join (
            SELECT floor(__time to ${period}) as my_time, count(*) as total_count
            FROM "dioptra-gt-combined-eventstream"
            WHERE __time >= TIMESTAMP '${from}' AND __time <= TIMESTAMP '${to}'
            AND model_id = '${model.name}'
            GROUP BY 1
        ) as my_count_table
        on my_table.my_time = my_count_table.my_time`;

    const seriesResult = await fetch(`${process.env.TIME_SERIES_DB}/druid/v2/sql/`, {
        method: 'post',
        body: JSON.stringify({query: seriesQuery}),
        headers: {'Content-Type': 'application/json'}
    });
    const seriesData = await seriesResult.json();

    const result = {
        model: model.name,
        onlineClassDistribution: {
            fraudulent: averagesData.find((item) => item.prediction === 'fraudulent').my_percentage,
            nonFraudulent: averagesData.find((item) => item.prediction === 'non_fraudulent').my_percentage,
            humanReview: averagesData.find((item) => item.prediction === 'human_review').my_percentage
        },
        offlineClassDistribution: model.offlineClassDistribution,
        ksTest: []
    };

    const dataMap = new Map();

    seriesData.forEach((dataPoint) => {
        const dataPointGroup = dataMap.get(dataPoint.time);

        if (!dataPointGroup) {
            dataMap.set(dataPoint.time, [dataPoint]);
        } else {
            dataPointGroup.push(dataPoint);
        }
    });

    const offlineDataVector = [
        model.offlineClassDistribution.fraudulent,
        model.offlineClassDistribution.nonFraudulent,
        model.offlineClassDistribution.humanReview
    ];

    dataMap.forEach((dataPointGroup, time) => {
        const dataVector = [
            dataPointGroup.find((dataPoint) => dataPoint.prediction === 'fraudulent').value,
            dataPointGroup.find((dataPoint) => dataPoint.prediction === 'non_fraudulent').value,
            dataPointGroup.find((dataPoint) => dataPoint.prediction === 'human_review').value
        ];
        const value = distance(offlineDataVector, dataVector);

        result.ksTest.push({time: new Date(time), value});
    });

    return res.send(result);
});

export default ModelRouter;
