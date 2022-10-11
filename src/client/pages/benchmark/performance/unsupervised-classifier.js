import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import PerformancePerClass from 'pages/common/performance-per-class';
import Segmentation from 'pages/common/segmentation';

const ImageClassifier = ({benchmarkFilters}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={2}>
                        <MetricInfoBox
                            name='Datapoints'
                        >
                            <CountEvents/>
                        </MetricInfoBox>
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('confidence', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('confidence', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='Confidence'>
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
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={[
                                () => metricsClient('entropy', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                }),
                                () => benchmarkFilters ? metricsClient('entropy', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox name='Entropy'>
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
            </div>
            <div className='my-3'>
                <PerformancePerClass/>
            </div>
            <Segmentation />
        </div>
    );
};

ImageClassifier.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default ImageClassifier;
