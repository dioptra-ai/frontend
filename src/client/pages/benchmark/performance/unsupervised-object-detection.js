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
import MapMarAnalysis from 'pages/common/map-mar-analysis';

const UnsupervisedObjectDetection = ({benchmarkFilters}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    return (
        <div className='pb-5'>
            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
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
                                () => metricsClient('map', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType,
                                    iou_threshold: 0.5
                                }),
                                () => benchmarkFilters ? metricsClient('map', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType,
                                    iou_threshold: 0.5
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox
                                        name='mAP'
                                        subtext='iou=0.5'
                                    >
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
                                () => metricsClient('mar', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType,
                                    iou_threshold: 0.5
                                }),
                                () => benchmarkFilters ? metricsClient('mar', {
                                    sql_filters: benchmarkFilters,
                                    model_type: mlModelType,
                                    iou_threshold: 0.5
                                }) : null
                            ]}
                            refetchOnChanged={[allSqlFilters, benchmarkFilters]}
                            renderData={([d, b]) => {
                                const value = d?.[0]?.value;
                                const benchmarkValue = b?.[0]?.value;

                                return (
                                    <MetricInfoBox
                                        name='mAR'
                                        subtext='iou=0.5'
                                    >
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
                <MapMarAnalysis/>
            </div>
        </div>
    );
};

UnsupervisedObjectDetection.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default UnsupervisedObjectDetection;
