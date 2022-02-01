import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';

const QnA = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    // This is ugly. Should find a better way to do it
    const d = new Date();
    const {mlModelType} = useModel();

    d.setDate(d.getDate() - 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    const liveModelFilters = `${allSqlFilters
        .replace(/\("dataset_id"=[^)]+\)/, '')
        .replace(/\("model_version"=[^)]+\)/, '')
        .replace(/\("benchmark_id"=[^)]+\)/, '')
        .replace(/AND(\s+AND)+/g, 'AND')
    } AND __time >= '${d.toISOString()}' AND "dataset_id" IS NULL AND "benchmark_id" IS NULL`;


    return (
        <div className='pb-3'>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <Row className='my-3 align-items-stretch'>
                <Col className='d-flex' lg={3}>
                    <MetricInfoBox
                        name='Datapoints'
                    >
                        {sampleSizeComponent}
                    </MetricInfoBox>
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('compute', {
                            metrics_type: 'outlier_detection',
                            current_filters: allSqlFilters,
                            reference_filters: liveModelFilters,
                            model_type: mlModelType
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(data) => {
                            const noveltyNum = data?.outlier_analysis?.filter((d) => d.novelty).length;

                            return (
                                <MetricInfoBox
                                    name='Obsolete'
                                    value={100 * noveltyNum / data?.outlier_analysis.length}
                                    unit='%'
                                    info='As of the last 24h of the model and version.'
                                />
                            );
                        }}
                    />
                </Col>
            </Row>
            <Row className='my-3 align-items-stretch'>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('exact-match', {
                            sql_filters: allSqlFilters,
                            model_type: 'Q_N_A'
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='EM'
                                subtext={sampleSizeComponent}
                                unit='%'
                                value={100 * d?.value}
                            />
                        )}
                    />
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('f1-score-metric', {
                            sql_filters: allSqlFilters,
                            model_type: 'Q_N_A'
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='F1 Score'
                                subtext={sampleSizeComponent}
                                unit='%'
                                value={100 * d?.value}
                            />
                        )}
                    />
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('semantic-similarity', {
                            sql_filters: allSqlFilters,
                            model_type: 'Q_N_A'
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='Semantic Similarity'
                                sampleSize={sampleSizeComponent}
                                unit='%'
                                value={100 * d?.value}
                            />
                        )}
                    />
                </Col>
            </Row>
            <Segmentation />
        </div>
    );
};

QnA.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    benchmarkFilters: PropTypes.string
};

export default setupComponent(QnA);
