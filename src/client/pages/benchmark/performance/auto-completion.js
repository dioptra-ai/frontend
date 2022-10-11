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
import useTimeGranularity from 'hooks/use-time-granularity';

const AutoCompletion = () => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const timeGranularity = useTimeGranularity()?.toISOString();

    return (
        <div className='pb-3'>
            <Row className='my-3 align-items-stretch'>
                <Col className='d-flex' lg={3}>
                    <MetricInfoBox
                        name='Datapoints'
                    >
                        <CountEvents/>
                    </MetricInfoBox>
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('exact-match', {
                            sql_filters: allSqlFilters,
                            time_granularity: timeGranularity,
                            model_type: mlModelType
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='Token Exact Match'
                                value={d?.value}
                            />
                        )}
                    />
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('f1-score-metric', {
                            sql_filters: allSqlFilters,
                            time_granularity: timeGranularity,
                            model_type: mlModelType
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='Token F1 Score'
                                value={d?.value}
                            />
                        )}
                    />
                </Col>
            </Row>
            <Segmentation />
        </div>
    );
};

AutoCompletion.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default AutoCompletion;
