/* eslint-disable max-lines */

import {Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis} from 'recharts';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import {useInView} from 'react-intersection-observer';

import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {IconNames, SQL_OFFLINE_RANGE} from 'constants';
import {getHexColor} from 'helpers/color-helper';
import FontIcon from 'components/font-icon';
import theme from 'styles/theme.module.scss';
import {setupComponent} from 'helpers/component-helper';
import timeseriesClient from 'clients/timeseries';

const FeatureIntegrityTableColumnNames = {
    FEATURE_NAME: 'Feature Name',
    INCIDENT_COUNT: 'Incident Count',
    TYPE: 'Type',
    SHAP: 'SHAP',
    ONLINE_DISTRIBUTION: 'Online Distribution',
    ONLINE_DISTRIBUTION_STATS: 'Online Distribution Stats',
    DISTANCE: 'Offline / Online Distribution Distance',
    CORRELATION_TO_PREDICTION: 'Correlation to Prediction',
    QUALITY_AND_OUTLIERS: 'Quality & Outliers',
    ACTION: 'Action'
};
const FeatureIntegrityTableColumnConfigs = [
    {name: FeatureIntegrityTableColumnNames.FEATURE_NAME},
    {name: FeatureIntegrityTableColumnNames.INCIDENT_COUNT},
    {name: FeatureIntegrityTableColumnNames.TYPE},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS},
    {name: FeatureIntegrityTableColumnNames.DISTANCE},
    {name: FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS}
];
const renderWarningCheckIcon = (isOk, fontSize) => {
    const iconName = isOk ? IconNames.CHECK : IconNames.WARNING;
    const colorClass = `text-${isOk ? 'success' : 'warning'}`;

    return (
        <FontIcon className={colorClass} icon={iconName} size={fontSize} />
    );
};

const OnlineDistributionTooltip = ({payload}) => {
    if (payload && payload.length) {
        const {payload: {value, dist}} = payload[0];

        return (
            <div className='p-3 bg-white shadow-lg'>
                <div>{(100 * Number(dist)).toFixed(2)}%</div>
                <div className='text-secondary' style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: 200
                }}><small>{value || '<empty>'}</small></div>
            </div>
        );
    }

    return null;
};

OnlineDistributionTooltip.propTypes = {
    payload: PropTypes.array
};

const OnlineDistributionBarChart = ({distribution}) => {
    return distribution ? (
        <div>
            <BarChart data={distribution.sort((d1, d2) => d1.value - d2.value)} height={120} width={150}>
                <Bar background={false} dataKey='dist' minPointSize={2}>
                    {distribution.map((d, i) => (
                        <Cell accentHeight='0px' fill={d.color} key={i}/>
                    ))}
                </Bar>
                <Tooltip content={<OnlineDistributionTooltip />} cursor={false}/>
            </BarChart>
        </div>
    ) : null;
};

OnlineDistributionBarChart.propTypes = {
    distribution: PropTypes.array
};

const FeatureIntegrityRow = ({name, timeStore}) => {
    const incidentCount = 4;
    const tdClasses = 'py-5 align-middle';
    const [featureType, setFeatureType] = useState(null);
    const [featureCardinality, setFeatureCardinality] = useState(null);
    const [featureOnlineDistribution, setFeatureOnlineDistribution] = useState(null);
    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView && !featureType) {

            timeseriesClient({
                query: `
                  SELECT "${name}" FROM "dioptra-gt-combined-eventstream"
                  WHERE "${name}" IS NOT NULL
                    AND ${timeStore.sqlTimeFilter}
                  LIMIT 100
                `
            }).then((values) => {

                if (values.some((v) => isNaN(v[name]))) {
                    setFeatureType('String');
                } else {
                    setFeatureType('Number');
                }
            }).catch(console.error);
        }
    }, [inView, timeStore.sqlTimeFilter]);

    useEffect(() => {

        if (inView && !featureCardinality) {

            timeseriesClient({
                query: `
                  SELECT COUNT(DISTINCT "${name}") as "count"
                  FROM "dioptra-gt-combined-eventstream"
                  WHERE "${name}" IS NOT NULL AND ${timeStore.sqlTimeFilter}
                `
            }).then((values) => {

                setFeatureCardinality(values[0].count);
            }).catch(console.error);
        }
    }, [inView, timeStore.sqlTimeFilter]);

    useEffect(() => {

        if (inView && featureCardinality) {

            if (featureType === 'String' || featureCardinality < 20) {

                timeseriesClient({
                    query: `
                            select 
                              cast(my_table.my_count as float) / cast(my_count_table.total_count as float) AS "dist", 
                              my_table."${name}" AS "value"
                              from (
                                  SELECT count(*) as my_count, "${name}"
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter}
                                  GROUP BY 2
                                  LIMIT 20
                              ) as my_table
                              NATURAL JOIN (
                                  SELECT count(*) as total_count
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter}
                                  LIMIT 20
                              ) as my_count_table
                            `
                }).then((values) => {

                    setFeatureOnlineDistribution(values);
                }).catch(console.error);
            } else if (featureType === 'Number') {

                timeseriesClient({
                    query: `WITH my_sample_table as (
                              SELECT
                                *,
                                CAST("${name}" AS FLOAT) as my_feature,
                                '1' as join_key
                              FROM "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sqlTimeFilter}
                              LIMIT 1000
                            ),

                            min_max_table as (
                              SELECT
                                min(my_feature) as my_min,
                                max(my_feature) as my_max,
                                (max(my_feature) - min(my_feature)) / 10 as my_bin_size,
                                '1' as join_key
                              FROM my_sample_table
                            )

                            SELECT cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as "dist", 
                                feature_bins as "value"
                            FROM (
                              SELECT 
                                feature_bins, count(*) as my_count, 1 as join_key
                              FROM (
                                SELECT 
                                  CASE
                                    WHEN
                                      my_sample_table.my_feature < min_max_table.my_min + min_max_table.my_bin_size
                                      THEN CONCAT(']-inf -', min_max_table.my_min + min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 2 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + min_max_table.my_bin_size, ' - ', min_max_table.my_min + 2 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 2 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 3 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 2 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 3 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 3 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 4 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 3 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 4 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 4 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 5 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 4 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 5 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 5 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 6 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 5 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 6 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 6 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 7 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 6 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 7 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 7 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 8 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 7 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 8 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 8 * min_max_table.my_bin_size
                                      AND my_sample_table.my_feature < min_max_table.my_min + 9 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 8 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 9 * min_max_table.my_bin_size, '[')
                                    WHEN
                                      my_sample_table.my_feature >= min_max_table.my_min + 9 * min_max_table.my_bin_size
                                      THEN CONCAT('[', min_max_table.my_min + 9 * min_max_table.my_bin_size, ' - inf [')
                                  END AS feature_bins
                                FROM my_sample_table
                                JOIN min_max_table
                                ON min_max_table.join_key = my_sample_table.join_key) as my_sub_table
                              GROUP BY 1
                            ) as my_table
                            join (
                              SELECT count(*) as total_count, 1 as join_key
                              FROM my_sample_table
                            ) as my_count_table
                            on my_table.join_key = my_count_table.join_key
                            `
                }).then((values) => {

                    setFeatureOnlineDistribution(values);
                }).catch(console.error);
            }
        }
    }, [featureType, featureCardinality, inView, timeStore.sqlTimeFilter]);

    return (
        <tr className='py-5' ref={ref}>
            <td className={tdClasses} colSpan={2}>
                <div className='bold-text'>{name}</div>
                <div className='text-secondary'><small>Lorem Ipsum</small></div>
            </td>
            <td className={tdClasses}>
                <div className='d-flex align-items-center justify-content-center'>
                    {renderWarningCheckIcon(incidentCount === 0, 25)}
                    {incidentCount > 0 ? <span className='ms-1 text-warning'>{incidentCount}</span> : ''}
                </div>
            </td>
            <td className={tdClasses}>{featureType}</td>
            <td className={tdClasses}>
                <OnlineDistributionBarChart distribution={featureOnlineDistribution?.map(({value, dist}) => ({
                    value, dist,
                    color: getHexColor(value, 0.65)
                }))}/>
            </td>
            <td className={tdClasses}>
                {['Top 4 values', '5684: 15%', '8902: 29.7%', '0058: 2.1%', '6001: 0.12%']
                    .map((s, i) => <div key={i}>{s.name}</div>)}
            </td>
            <td className={tdClasses}>
                {
                    featureType && featureCardinality ? (
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <div style={{height: 150}}>
                                    <ResponsiveContainer height='100%' width='100%'>
                                        <AreaChart data={data.map(({x, y}) => ({
                                            y,
                                            x: new Date(x).getTime()
                                        }))}>
                                            <defs>
                                                <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                                                    <stop offset='10%' stopColor={theme.primary} stopOpacity={0.7}/>
                                                    <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                                                </linearGradient>
                                                <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                                                    <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9}/>
                                                    <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                axisLine={false}
                                                dataKey='x'
                                                domain={timeStore.rangeMillisec}
                                                scale='time'
                                                tick={false}
                                                type='number'
                                            />
                                            <Area
                                                dataKey='y'
                                                fill='url(#color)'
                                                stroke={theme.primary}
                                                strokeWidth={2}
                                            />
                                            <Tooltip/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                            sql={(featureType === 'String' || featureCardinality < 4) ? sql`
                                WITH my_online_sample_table as (
                                  SELECT
                                    *,
                                    "${name}" as my_feature
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter}
                                ),

                                my_offline_sample_table as (
                                  SELECT
                                    *,
                                    "${name}" as my_feature
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${SQL_OFFLINE_RANGE}
                                ),

                                my_online_table as (
                                  SELECT
                                    my_table.my_time,
                                    cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                    my_feature
                                  FROM (
                                    SELECT
                                      floor(__time to MINUTE) as my_time,
                                      count(1) as my_count,
                                      CASE WHEN my_feature <> '' THEN my_feature ELSE 'null' END as my_feature
                                    FROM my_online_sample_table
                                    GROUP BY 1, 3
                                  ) as my_table
                                  JOIN (
                                    SELECT
                                      floor(__time to MINUTE) as my_time,
                                      count(*) as total_count
                                    FROM my_online_sample_table
                                    GROUP BY 1
                                  ) as my_count_table
                                  ON my_table.my_time = my_count_table.my_time
                                ),

                                my_offline_table as (
                                  SELECT
                                    cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage, 
                                    my_feature
                                  FROM (
                                    SELECT
                                      count(1) as my_count,
                                      CASE WHEN my_feature <> '' THEN my_feature ELSE 'null' END as my_feature,
                                      1 as join_key
                                    FROM my_offline_sample_table
                                    GROUP BY 2
                                  ) as my_table
                                  JOIN (
                                    SELECT
                                      count(*) as total_count,
                                      1 as join_key
                                    FROM my_offline_sample_table
                                  ) as my_count_table
                                  ON my_table.join_key = my_count_table.join_key
                                )

                                SELECT
                                  my_online_table.my_time as x,
                                  sqrt(sum(POWER(my_online_table.my_percentage - my_offline_table.my_percentage, 2))) as y
                                FROM my_online_table
                                JOIN my_offline_table
                                  ON my_offline_table.my_feature = my_online_table.my_feature
                                GROUP BY 1
                            ` : sql`
                                WITH my_online_sample_table as (
                                  SELECT
                                    *,
                                    CAST("${name}" AS FLOAT) as my_feature,
                                    '1' as join_key
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${timeStore.sqlTimeFilter}
                                ),

                                my_offline_sample_table as (
                                  SELECT
                                    *,
                                    CAST("${name}" AS FLOAT) as my_feature,
                                    '1' as join_key
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${SQL_OFFLINE_RANGE}
                                  LIMIT 1000
                                ),

                                min_max_table as (
                                  SELECT
                                    min(my_feature) as my_min,
                                    max(my_feature) as my_max,
                                    (max(my_feature) - min(my_feature)) / 10 as my_bin_size,
                                    '1' as join_key
                                  FROM my_online_sample_table
                                ),

                                my_online_table as (
                                  SELECT
                                    my_table.my_time,
                                    CAST(my_table.my_count as FLOAT) / cast(my_count_table.total_count as FLOAT) as my_percentage, 
                                    feature_bins
                                  FROM (
                                    SELECT
                                      floor(__time to MINUTE) as my_time,
                                      count(1) as my_count,
                                      CASE
                                        WHEN
                                          my_online_sample_table.my_feature < min_max_table.my_min + min_max_table.my_bin_size
                                          THEN CONCAT(']-inf -', min_max_table.my_min + min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 2 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + min_max_table.my_bin_size, ' - ', min_max_table.my_min + 2 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 2 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 3 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 2 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 3 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 3 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 4 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 3 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 4 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 4 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 5 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 4 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 5 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 5 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 6 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 5 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 6 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 6 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 7 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 6 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 7 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 7 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 8 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 7 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 8 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 8 * min_max_table.my_bin_size
                                          AND my_online_sample_table.my_feature < min_max_table.my_min + 9 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 8 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 9 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_online_sample_table.my_feature >= min_max_table.my_min + 9 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 9 * min_max_table.my_bin_size, ' - inf [')
                                      END AS feature_bins
                                    FROM my_online_sample_table
                                    JOIN min_max_table
                                    ON min_max_table.join_key = my_online_sample_table.join_key
                                    GROUP BY 1, 3
                                  ) as my_table
                                  JOIN (
                                    SELECT floor(__time to MINUTE) as my_time, count(*) as total_count
                                    FROM my_online_sample_table
                                    GROUP BY 1
                                  ) as my_count_table
                                  ON my_table.my_time = my_count_table.my_time
                                ),

                                my_offline_table as (
                                  SELECT
                                    CAST(my_table.my_count as FLOAT) / CAST(my_count_table.total_count as FLOAT) as my_percentage, 
                                    feature_bins
                                  FROM (
                                    SELECT
                                      count(1) as my_count,
                                      CASE
                                        WHEN
                                          my_offline_sample_table.my_feature < min_max_table.my_min + min_max_table.my_bin_size
                                          THEN CONCAT(']-inf -', min_max_table.my_min + min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 2 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + min_max_table.my_bin_size, ' - ', min_max_table.my_min + 2 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 2 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 3 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 2 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 3 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 3 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 4 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 3 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 4 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 4 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 5 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 4 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 5 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 5 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 6 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 5 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 6 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 6 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 7 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 6 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 7 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 7 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 8 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 7 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 8 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 8 * min_max_table.my_bin_size
                                          AND my_offline_sample_table.my_feature < min_max_table.my_min + 9 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 8 * min_max_table.my_bin_size, ' - ', min_max_table.my_min + 9 * min_max_table.my_bin_size, '[')
                                        WHEN
                                          my_offline_sample_table.my_feature >= min_max_table.my_min + 9 * min_max_table.my_bin_size
                                          THEN CONCAT('[', min_max_table.my_min + 9 * min_max_table.my_bin_size, ' - inf [')
                                      END AS feature_bins,
                                      1 as join_key
                                    FROM my_offline_sample_table
                                    JOIN min_max_table
                                    ON min_max_table.join_key = my_offline_sample_table.join_key
                                    GROUP BY 2
                                  ) as my_table
                                  JOIN (
                                    SELECT
                                      count(*) as total_count,
                                      1 as join_key
                                    FROM my_offline_sample_table
                                  ) as my_count_table
                                  ON my_table.join_key = my_count_table.join_key
                                )

                                SELECT
                                  my_online_table.my_time as x,
                                  sqrt(sum(POWER(my_online_table.my_percentage - my_offline_table.my_percentage, 2))) as y
                                FROM my_online_table
                                JOIN my_offline_table
                                ON my_offline_table.feature_bins = my_online_table.feature_bins
                                GROUP BY 1
                            `}
                        />
                    ) : null
                }
            </td>
            <td className={tdClasses}>
                {['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
                    .map((s, i) => <div className='d-flex' key={i}>{s.name}</div>)}
            </td>
        </tr>
    );
};

FeatureIntegrityRow.propTypes = {
    name: PropTypes.string,
    timeStore: PropTypes.object
};

const ObserverFeatureIntegrityRow = setupComponent(FeatureIntegrityRow);

const FeatureIntegrityTable = ({errorStore, timeStore}) => {
    const [allFeatureNames, setAllFeatureNames] = useState(null);
    const [nonNullFeatureNames, setNonNullFeatureNames] = useState([]);

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'dioptra-gt-combined-eventstream' AND COLUMN_NAME LIKE 'feature.%'
                `
        }).then((res) => {
            setAllFeatureNames(res.map((row) => row['COLUMN_NAME']));
        }).catch((e) => errorStore.reportError(e));
    }, []);

    useEffect(() => {

        if (allFeatureNames) {

            timeseriesClient({
                query: `
                    SELECT ${allFeatureNames.map((f) => `COUNT("${f}")`).join(', ')}
                    FROM "dioptra-gt-combined-eventstream"
                    WHERE ${timeStore.sqlTimeFilter}
                `,
                resultFormat: 'array'
            }).then(([nonNullCounts]) => {

                setNonNullFeatureNames(allFeatureNames.filter((_, i) => nonNullCounts && nonNullCounts[i] !== 0));
            }).catch((e) => errorStore.reportError(e));
        }
    }, [allFeatureNames, timeStore.sqlTimeFilter]);

    return (
        <div className='border border-1 px-3 pb-3 pt-2 rounded'>
            <Table>
                <thead className='fs-6'>
                    <tr className='border-0 border-bottom border-mercury'>
                        {FeatureIntegrityTableColumnConfigs.map((c, idx) => (<th className={`align-middle border-0 text-secondary pb-3 ${idx === 0 ? 'w-25' : ''} ${idx === 1 ? 'text-center' : ''}`} colSpan={idx > 0 ? 1 : 2} key={c.name}>{c.name}</th>))}
                    </tr>
                </thead>
                <tbody className='fs-6'>
                    {nonNullFeatureNames.map((f) => <ObserverFeatureIntegrityRow key={f} name={f}/>)}
                </tbody>
            </Table>
        </div>
    );
};

FeatureIntegrityTable.propTypes = {
    errorStore: PropTypes.object,
    timeStore: PropTypes.object
};

export default setupComponent(FeatureIntegrityTable);
