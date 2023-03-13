import {postgresClient} from './index.mjs';

import {getHistogram} from '../common/utils.mjs';

class Prediction {
    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT id, datapoint, task_type, class_name, class_names,
                    confidence, confidences, segmentation_class_mask, top, "left", height, width, metrics, model_name
                 FROM predictions WHERE organization_id = $1 AND datapoint = ANY($2)`,
                [organizationId, datapointIds]
            );

            return rows;
        }
    }

    static async deleteByIds(organizationId, ids) {
        const {rows} = await postgresClient.query(
            'DELETE FROM predictions WHERE id = ANY($1) AND organization_id = $2 RETURNING *',
            [ids, organizationId]
        );

        return rows;
    }

    static async getDistribution(organizationId, datapointIds) {
        const {rows: segmentationCountRows} = await postgresClient.query(
            `SELECT COUNT(*) AS count
             FROM predictions
             WHERE organization_id = $1 AND datapoint = ANY($2) AND task_type = 'SEGMENTATION'
             GROUP BY datapoint`,
            [organizationId, datapointIds]
        );

        if (segmentationCountRows[0]?.['count']) {
            // Calculate the histogram of flat segmentation_class_masks over batches of 100 datapoints
            const getHistogramForDatapointIds = async (datapointIds) => {
                // Fetch a batch of segmentation_class_masks
                const {rows: segmentationClassMaskRows} = await postgresClient.query(
                    `SELECT segmentation_class_mask, class_names FROM predictions
                        WHERE organization_id = $1 AND datapoint = ANY($2) AND task_type = 'SEGMENTATION'`,
                    [organizationId, datapointIds]
                );

                // Flatten the segmentation_class_masks and calculate the histogram
                return segmentationClassMaskRows.reduce((acc, prediction) => {
                    const classMask = prediction['segmentation_class_mask'].flat();
                    const classNames = prediction['class_names'];

                    return getHistogram(classMask, (classId) => classNames[classId], acc);
                }, {});
            };

            const datapointBatches = [];

            for (let i = 0; i < segmentationCountRows.length; i += 100) {
                datapointBatches.push(datapointIds.slice(i, i + 100));
            }

            const histogram = {};

            for (const batch of datapointBatches) {
                const batchHist = await getHistogramForDatapointIds(batch); // eslint-disable-line no-await-in-loop

                Object.keys(batchHist).forEach((key) => {
                    if (!histogram[key]) {
                        histogram[key] = 0;
                    }
                    histogram[key] += batchHist[key];
                });
            }

            return {
                histogram,
                taskType: 'SEGMENTATION'
            };
        } else {
            // Else count the number of class_names for each datapoint
            const {rows: classificationCountRows} = await postgresClient.query(
                `SELECT COUNT(*) AS count, class_name
                    FROM predictions
                    WHERE organization_id = $1 AND datapoint = ANY($2)
                    GROUP BY class_name`,
                [organizationId, datapointIds]
            );

            return {
                histogram: classificationCountRows.reduce((acc, row) => {
                    acc[row['class_name']] = row['count'];

                    return acc;
                }, {}),
                taskType: 'CLASSIFICATION'
            };
        }
    }
}

export default Prediction;
