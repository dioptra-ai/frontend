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
import Async from 'components/async';
import baseJsonClient from 'clients/base-json-client';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';

const FeatureAnalysisImages = ({filtersStore, timeStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const timeGranularity = timeStore.getTimeGranularity().toISOString();

    return (
        <div>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />

            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Unique Images</h3>
                <Row>
                    <Col className='d-flex' lg={2}>
                        <TimeseriesQuery
                            defaultData={[{unique: NaN}]}
                            renderData={([{unique}]) => (
                                <MetricInfoBox name='% Unique' unit='%' value={unique} />
                            )}
                            sql={sql`
                                SELECT 100 * CAST(COUNT(distinct MV_TO_STRING("embeddings", '')) as double) / COUNT(*) as "unique"
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
                                100 * CAST(COUNT(distinct MV_TO_STRING("embeddings", '')) as double) / COUNT(*) as "uniques"
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
                                        name,
                                        value,
                                        fill: getHexColor(value)
                                    }))}
                                    title='Rotation Angle'
                                    yAxisName='Degrees'
                                />
                            )}
                            sql={sql`
                            SELECT CAST("image_metadata.rotation" AS INTEGER) as "name",
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
                        <Async refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => baseJsonClient('/api/metrics', {
                                method: 'post',
                                body:
                                {
                                    metrics_type: 'bi_non_cat_distance',
                                    reference_filters: allOfflineSqlFilters,
                                    current_filters: allSqlFilters,
                                    time_granularity: timeGranularity
                                }
                            })}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.distance.map(({time, distance}) => ({
                                        y: distance * 100,
                                        x: new Date(time).getTime()
                                    }))}
                                    isTimeDependent
                                    title='Embedding Distance'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Distance (%)'
                                />
                            )
                            }
                        />
                    </div>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Feature Space Outliers</h3>
                <Row>
                    <Col>
                        <Async refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => baseJsonClient('/api/metrics', {
                                method: 'post',
                                body:
                                {
                                    metrics_type: 'outlier_detection',
                                    current_filters: allSqlFilters,
                                    reference_filters: allOfflineSqlFilters
                                }
                            })}
                            renderData={(data) => (
                                <ScatterGraph data={data.outlier_analysis.map(({image_url, dimensions, outlier, novelty}) => ({
                                    samples: [image_url],
                                    PCA1: dimensions[0],
                                    PCA2: dimensions[1],
                                    outlier,
                                    novelty
                                }))}
                                />
                            )}
                        />
                    </Col>
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
