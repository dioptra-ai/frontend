import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import FilterInput from 'components/filter-input';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import MetricInfoBox from 'components/metric-info-box';
import AreaGraph from 'components/area-graph';
import BarGraph from 'components/bar-graph';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';

const FeatureAnalysisImages = ({filtersStore, timeStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const timeGranularity = timeStore.getTimeGranularityMs().toISOString();

    return (
        <div>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Unique Images</h3>
                <Row>
                    <Col className='d-flex' lg={2}>
                        <TimeseriesQuery
                            defaultData={[{unique: NaN}]}
                            renderData={([{unique}]) => (
                                <MetricInfoBox
                                    name='% Unique'
                                    unit='%'
                                    value={unique}
                                />
                            )}
                            sql={sql`
                                SELECT 100 * CAST(COUNT(distinct MV_TO_STRING("feature.image_embedding", '')) as double) / COUNT(*) as "unique"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${allSqlFilters}
                            `}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({uniques, __time}) => ({
                                        y: uniques,
                                        x: new Date(__time).getTime()
                                    }))}
                                    isTimeDependent
                                    title='Unique Images Over Time'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Unique Images (%)'
                                />
                            )}
                            sql={sql`
                                SELECT TIME_FLOOR(__time, '${timeGranularity}') as "__time",
                                100 * CAST(COUNT(distinct MV_TO_STRING("feature.image_embedding", '')) as double) / COUNT(*) as "uniques"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${allSqlFilters}
                                GROUP BY 1
                            `}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({name, value}) => ({
                                        name, value,
                                        fill: getHexColor(value)
                                    }))}
                                    title='Rotation Angle'
                                    yAxisName='Degrees'
                                />
                            )}
                            sql={sql`
                            SELECT CAST("feature.rotation" AS INTEGER) as "name",
                              COUNT(*) AS "value"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${allSqlFilters}
                                GROUP BY 1
                                ORDER BY 1 ASC
                            `}
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Embedding Analysis</h3>
                <Row>
                    <div>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({my_distance, my_time}) => ({
                                        y: my_distance,
                                        x: new Date(my_time).getTime()
                                    }))}
                                    isTimeDependent
                                    title='Embedding Distance'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Distance (%)'
                                />
                            )}
                            sql={sql`
                                with sample_table as (
                                  SELECT *
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${allSqlFilters}
                                  LIMIT 10000
                                ),

                                offline_sample_table as (
                                  SELECT *
                                  FROM "dioptra-gt-combined-eventstream"
                                  WHERE ${allOfflineSqlFilters}
                                  LIMIT 10000
                                ),

                                my_online_table as (
                                  SELECT
                                    1 as join_key,
                                    TIME_FLOOR(__time, '${timeGranularity}') as my_time,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_0,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= -2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_1,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= -1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -0 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_2,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 0 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_3,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_4,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 3 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_5,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 3 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_6,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_7,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_0,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= -2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_1,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= -1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -0 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_2,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 0 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_3,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_4,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 3 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_5,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 3 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_6,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_7
                                    FROM sample_table
                                  GROUP BY 1, 2),
                                my_offline_table as (
                                  SELECT
                                    1 as join_key,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_0,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= -2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_1,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= -1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < -0 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_2,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 0 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_3,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_4,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 3 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_5,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 3 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) < 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_6,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 0) >= 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_0_7,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_0,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= -2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_1,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= -1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < -0 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_2,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 0 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 1 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_3,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 1 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 2 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_4,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 2 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 3 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_5,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 3 AND MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) < 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_6,
                                    CAST(SUM(case WHEN MV_OFFSET(STRING_TO_MV(MV_OFFSET(REPLACE(REPLACE("feature.image_embedding", '[', ''), ']', ''), 0), ', '), 1) >= 4 THEN 1 ELSE 0 END) AS DOUBLE) / count(*) as dim_1_7
                                    FROM offline_sample_table)

                                select
                                  my_online_table.my_time,
                                  100 * sqrt(
                                    POWER(my_online_table.dim_0_0 - my_offline_table.dim_0_0, 2) +
                                    POWER(my_online_table.dim_0_1 - my_offline_table.dim_0_1, 2) +
                                    POWER(my_online_table.dim_0_2 - my_offline_table.dim_0_2, 2) +
                                    POWER(my_online_table.dim_0_3 - my_offline_table.dim_0_3, 2) +
                                    POWER(my_online_table.dim_0_4 - my_offline_table.dim_0_4, 2) +
                                    POWER(my_online_table.dim_0_5 - my_offline_table.dim_0_5, 2) +
                                    POWER(my_online_table.dim_0_6 - my_offline_table.dim_0_6, 2) +
                                    POWER(my_online_table.dim_0_7 - my_offline_table.dim_0_7, 2) +
                                    POWER(my_online_table.dim_0_0 - my_offline_table.dim_0_0, 2) +
                                    POWER(my_online_table.dim_1_1 - my_offline_table.dim_1_1, 2) +
                                    POWER(my_online_table.dim_1_2 - my_offline_table.dim_1_2, 2) +
                                    POWER(my_online_table.dim_1_3 - my_offline_table.dim_1_3, 2) +
                                    POWER(my_online_table.dim_1_4 - my_offline_table.dim_1_4, 2) +
                                    POWER(my_online_table.dim_1_5 - my_offline_table.dim_1_5, 2) +
                                    POWER(my_online_table.dim_1_6 - my_offline_table.dim_1_6, 2) +
                                    POWER(my_online_table.dim_1_7 - my_offline_table.dim_1_7, 2)
                                  ) as my_distance
                                from my_online_table
                                join my_offline_table
                                on my_offline_table.join_key = my_online_table.join_key
                            `}
                        />
                    </div>
                </Row>
            </div>
        </div>
    );
};

FeatureAnalysisImages.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysisImages);
