import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import FilterInput from 'components/filter-input';
import MetricInfoBox from 'components/metric-info-box';
import AreaGraph from 'components/area-graph';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';

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
            <div className='my-3'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Embedding Analysis</h3>
                <Row>
                    <div>
                        <Async
                            refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => metricsClient('', {
                                metrics_type: 'bi_non_cat_distance',
                                reference_filters: allOfflineSqlFilters,
                                current_filters: allSqlFilters,
                                time_granularity: timeGranularity
                            })}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data?.distance?.map(({time, distance}) => ({
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
            <div className='my-3'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Feature Space Outliers</h3>
                <Row>
                    <Col>
                        <Async refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => metricsClient('', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: allOfflineSqlFilters
                            })}
                            renderData={(data) => (
                                <ScatterGraph
                                    data={data?.outlier_analysis?.map(({image_url, dimensions, outlier, novelty}) => ({
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
            <div className='my-3'>
                <h3 className='text-dark bold-text fs-3 mb-3'>Unique Images</h3>
                <Row>
                    <Col className='d-flex' lg={2}>
                        <Async
                            defaultData={{value: NaN}}
                            renderData={({value}) => (
                                <MetricInfoBox name='% Unique' unit='%' value={100 * value} />
                            )}
                            fetchData={() => metricsClient('query/unique-images', {sql_filters: allSqlFilters})}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <Async
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({time, value}) => ({time, value: 100 * value}))}
                                    xDataKey='time'
                                    yDataKey='value'
                                    isTimeDependent
                                    title='Unique Images Over Time'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Unique Images'
                                    unit='%'
                                />
                            )}
                            fetchData={() => metricsClient('query/unique-images-over-time', {time_granularity: timeGranularity, sql_filters: allSqlFilters})}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <Async
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
                            fetchData={() => metricsClient('query/rotation-angle', {sql_filters: allSqlFilters})}
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
