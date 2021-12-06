import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'components/filter-input';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import baseJsonClient from 'clients/base-json-client';
import ScatterGraph from 'components/scatter-graph';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';

const FeatureAnalysisText = ({filtersStore, timeStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const timeGranularity = timeStore.getTimeGranularity().toISOString();

    return (<>
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
    </>);
};

FeatureAnalysisText.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysisText);
