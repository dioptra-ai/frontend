import {postgresClient} from './index.mjs';

import {getHistogram} from '../common/utils.mjs';

class Groundtruth {
    static async findByDatapointIds(organizationId, datapointIds) {
        if (!datapointIds.length) {

            return [];
        } else {
            const {rows} = await postgresClient.query(
                `SELECT id, datapoint, task_type, class_name, class_names, 
                        segmentation_class_mask, top, "left", height, width
                 FROM groundtruths WHERE organization_id = $1 AND datapoint = ANY($2)`,
                [organizationId, datapointIds]
            );

            return rows;
        }
    }

    static async deleteByIds(organizationId, ids) {
        const {rows} = await postgresClient.query(
            'DELETE FROM groundtruths WHERE id = ANY($1) AND organization_id = $2 RETURNING *',
            [ids, organizationId]
        );

        return rows;
    }

    static async getDistribution(organizationId, datapointIds) {
        const {rows: segmentationCountRows} = await postgresClient.query(
            `SELECT COUNT(*) AS count
             FROM groundtruths
             WHERE organization_id = $1 AND datapoint = ANY($2) AND task_type = 'SEGMENTATION'
             GROUP BY datapoint`,
            [organizationId, datapointIds]
        );

        if (segmentationCountRows[0]?.['count']) {
            // Calculate the histogram of flat segmentation_class_masks over batches of 100 datapoints
            const getHistogramForDatapointIds = async (datapointIds) => {
                // Fetch a batch of segmentation_class_masks
                const {rows: segmentationClassMaskRows} = await postgresClient.query(
                    `SELECT segmentation_class_mask, class_names FROM groundtruths
                        WHERE organization_id = $1 AND datapoint = ANY($2) AND task_type = 'SEGMENTATION'`,
                    [organizationId, datapointIds]
                );

                // Flatten the segmentation_class_masks and calculate the histogram
                return segmentationClassMaskRows.reduce((acc, groundtruth) => {
                    const classMask = groundtruth['segmentation_class_mask'].flat();
                    const classNames = groundtruth['class_names'];

                    return getHistogram(classMask, (classId) => classNames[classId], acc);
                }, {});
            };

            const datapointBatches = [];

            for (let i = 0; i < segmentationCountRows.length; i += 100) {
                datapointBatches.push(datapointIds.slice(i, i + 100));
            }

            const histograms = await Promise.all(datapointBatches.map(getHistogramForDatapointIds));

            return {
                histogram: histograms.reduce((acc, histogram) => {
                    Object.keys(histogram).forEach((key) => {
                        if (!acc[key]) {
                            acc[key] = 0;
                        }
                        acc[key] += histogram[key];
                    });

                    return acc;
                }),
                taskType: 'SEGMENTATION'
            };
        } else {
            // Else count the number of class_names for each datapoint
            const {rows: classificationCountRows} = await postgresClient.query(
                `SELECT COUNT(*) AS count, class_name
                    FROM groundtruths
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

export default Groundtruth;
