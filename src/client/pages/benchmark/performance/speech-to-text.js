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

const SpeechToText = ({benchmarkFilters}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    return (
        <div className='pb-3'>
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
                        fetchData={[
                            () => metricsClient('exact-match', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType
                            }),
                            () => benchmarkFilters ? metricsClient('exact-match', {
                                sql_filters: benchmarkFilters,
                                model_type: mlModelType
                            }) : null
                        ]}
                        refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                        renderData={([d, b]) => {
                            const value = d?.[0]?.value;
                            const benchmarkValue = b?.[0]?.value;

                            return (
                                <MetricInfoBox name='EM'>
                                    {Number(value).toFixed(2)}
                                    {benchmarkValue ? (
                                        <span className='fs-1 text-secondary'>
                                            {` | ${Number(benchmarkValue).toFixed(2)}`}
                                        </span>) : null
                                    }
                                </MetricInfoBox>
                            );
                        }}
                    />
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={[
                            () => metricsClient('word-error-rate', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType
                            }),
                            () => benchmarkFilters ? metricsClient('word-error-rate', {
                                sql_filters: benchmarkFilters,
                                model_type: mlModelType
                            }) : null
                        ]}
                        refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                        renderData={([d, b]) => {
                            const value = d?.[0]?.value;
                            const benchmarkValue = b?.[0]?.value;

                            return (
                                <MetricInfoBox name='WER'>
                                    {Number(value).toFixed(2)}
                                    {benchmarkValue ? (
                                        <span className='fs-1 text-secondary'>
                                            {` | ${Number(benchmarkValue).toFixed(2)}`}
                                        </span>) : null
                                    }
                                </MetricInfoBox>
                            );
                        }}
                    />
                </Col>
            </Row>
            <Segmentation />
        </div>
    );
};

SpeechToText.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default SpeechToText;
