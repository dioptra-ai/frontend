/* eslint-disable max-lines */
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import MetricInfoBox from 'components/metric-info-box';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import CountEvents from 'components/count-events';
import CorrelationToKPIs from 'pages/common/correlation-to-kpis';
import Throughput from 'pages/common/throughput';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'},
    EXACT_MATCH: {value: 'EXACT_MATCH', name: 'Exact Match'},
    MEAN_AVERAGE_PRECISION: {value: 'MEAN_AVERAGE_PRECISION', name: 'mAP'},
    MEAN_AVERAGE_RECALL: {value: 'MEAN_AVERAGE_RECALL', name: 'mAR'},
    SEMANTIC_SIMILARITY: {value: 'SEMANTIC_SIMILARITY', name: 'Semantic Similarity'},
    CONFIDENCE: {value: 'CONFIDENCE', name: 'Confidence'}
};

const PerformanceOverview = () => {
    const allSqlFilters = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const model = useModel();
    const sampleSizeComponent = (<CountEvents sqlFilters={allSqlFilters}/>);

    const getQueryForMetric = (metricName, timeGranularity, sqlFilters = allSqlFilters) => {

        return {
            [ModelPerformanceMetrics.CONFIDENCE.value]: () => {

                return metricsClient('confidence', {
                    sql_filters: sqlFilters,
                    time_granularity: timeGranularity,
                    model_type: model.mlModelType
                });
            }
        }[metricName];
    };

    return (
        <>
            <div className='my-2'>
                <Row>
                    <Col>
                        <Throughput sqlFilters={allSqlFilters}/>
                    </Col>
                </Row>
            </div>
            <div className='my-3'>

                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <Async
                            fetchData={getQueryForMetric('CONFIDENCE')}
                            refetchOnChanged={[model, allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='Confidence'
                                    subtext={sampleSizeComponent}
                                    unit='%'
                                    value={100 * d?.value}
                                />
                            )}
                        />
                    </Col>
                </Row>
                <CorrelationToKPIs selectableMetrics={[
                    {value: 'CONFIDENCE', name: 'Confidence'}
                ]}/>
            </div>
        </>
    );
};

export default PerformanceOverview;
