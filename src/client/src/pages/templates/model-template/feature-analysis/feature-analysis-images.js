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

const dummyOutlierData = [
    {
        PCA1: 123,
        PCA2: 456,
        outlier: true,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 234,
        PCA2: 567,
        outlier: false,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 345,
        PCA2: 678,
        outlier: true,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 456,
        PCA2: 789,
        outlier: true,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 567,
        PCA2: 890,
        outlier: true,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 678,
        PCA2: 901,
        outlier: false,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 789,
        PCA2: 12,
        outlier: true,
        samples: [
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com',
            'https://xyz.com'
        ]
    },
    {
        PCA1: 890,
        PCA2: 123,
        outlier: true,
        samples: ['https://xyz.com']
    },
    {
        PCA1: 500,
        PCA2: 500,
        outlier: false
    }
];

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
                                        name,
                                        value,
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
                        <Async refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => {
                                return baseJsonClient('/api/metrics', {
                                    method: 'post',
                                    body:
                                    {
                                        metrics_type: 'bi_non_cat_distance',
                                        reference_filters: allOfflineSqlFilters,
                                        current_filters: allSqlFilters,
                                        time_granularity: timeGranularity
                                    }
                                });
                            }}
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
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={() => <ScatterGraph data={dummyOutlierData} />}
                            sql={sql`SELECT 1`}
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
