import {useContext} from 'react';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CountEvents from 'components/count-events';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';
import Throughput from 'pages/common/throughput';
import comparisonContext from 'context/comparison-context';

const PerformanceOverview = () => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const sqlFiltersWithModelTime = useAllSqlFilters({
        useReferenceFilters: true,
        __REMOVE_ME__excludeOrgId: true
    });
    const {total: comparisonTotal} = useContext(comparisonContext);
    const metricBoxBreakpoints = [{}, {
        xs: 3
    }, {
        xs: 3
    }, {
        xs: 3,
        md: 2
    }, {
        s: 3,
        md: 2
    }][comparisonTotal];

    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);

    return (
        <>
            <div className='my-2'>
                <Throughput sqlFilters={allSqlFilters}/>
            </div>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col xs={3} className='d-flex' {...metricBoxBreakpoints[comparisonTotal]}>
                        <Async
                            renderData={([[data], [benchmarkData]]) => (
                                <MetricInfoBox
                                    name='Confidence'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * data?.value}
                                    difference={100 * (data?.value - benchmarkData?.value)}
                                />
                            )}
                            fetchData={[
                                () => metricsClient('confidence', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'UNSUPERVISED_IMAGE_CLASSIFIER'
                                }),
                                () => metricsClient('confidence', {
                                    sql_filters: sqlFiltersWithModelTime,
                                    model_type: 'UNSUPERVISED_IMAGE_CLASSIFIER'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                        />
                    </Col>
                    <Col xs={3} className='d-flex' {...metricBoxBreakpoints[comparisonTotal]}>
                        <Async
                            renderData={([[data], [benchmarkData]]) => (
                                <MetricInfoBox
                                    name='Entropy'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * Math.abs(data?.value - 0.1703)}
                                    difference={100 * (data?.value - benchmarkData?.value)}
                                />
                            )}
                            fetchData={[
                                () => metricsClient('confidence', {
                                    sql_filters: allSqlFilters,
                                    model_type: 'UNSUPERVISED_IMAGE_CLASSIFIER'
                                }),
                                () => metricsClient('confidence', {
                                    sql_filters: sqlFiltersWithModelTime,
                                    model_type: 'UNSUPERVISED_IMAGE_CLASSIFIER'
                                })
                            ]}
                            refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                        />
                    </Col>
                </Row>
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'CONFIDENCE', name: 'Confidence'},
                    {value: 'ENTROPY', name: 'Entropy'}
                ]}/>
            </div>
        </>
    );
};

export default PerformanceOverview;
