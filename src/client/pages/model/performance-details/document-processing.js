import {Bar, Tooltip as ChartTooltip} from 'recharts';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import MetricInfoBox from 'components/metric-info-box';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import {getHexColor} from 'helpers/color-helper';

const PerformanceDetails = () => {
    const allSqlFilters = useAllSqlFilters();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    // This is ugly. Should find a better way to do it
    const d = new Date();

    d.setDate(d.getDate() - 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

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
                </Row>
            </div>

            <div className='my-3'>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAP'
                                    subtext='iou=0.5'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAP'
                                    subtext='iou=0.75'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.95
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAP'
                                    subtext='iou=0.95'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAR'
                                    subtext='iou=0.5'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAR'
                                    subtext='iou=0.75'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                    <Col className='d-flex' lg={2}>
                        <Async
                            fetchData={() => metricsClient('mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.95
                            })}
                            refetchOnChanged={[allSqlFilters]}
                            renderData={([d]) => (
                                <MetricInfoBox
                                    name='mAR'
                                    subtext='iou=0.95'
                                    value={d?.value}
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>

            <div className='my-3'>
                <div className='d-flex my-3' lg={12}>
                    <Async
                        renderData={([iou05, iou075, iou09]) => {
                            const classNames = iou05.map((d) => {

                                return d['groundtruth.class_name'];
                            });
                            const bars = classNames.map((name) => ({
                                name,
                                iou05: (iou05.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4),
                                iou075: (iou075.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4),
                                iou09: (iou09.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4)
                            }));

                            return (
                                <BarGraph
                                    bars={bars}
                                    title='Precision'
                                    unit='%'
                                    yAxisName='Precision'
                                    yAxisDomain={[0, 100]}
                                    barGap={1}
                                    barCategoryGap={80}
                                >
                                    <ChartTooltip />
                                    <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                    <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                    <Bar maxBarSize={40} dataKey='iou09' fill={getHexColor('iou09')}/>
                                </BarGraph>
                            );
                        }}
                        refetchOnChanged={[allSqlFilters]}
                        fetchData={[
                            () => metricsClient('/map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/map', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.9,
                                group_by: ['groundtruth.class_name']
                            })
                        ]}
                    />
                </div>
                <div className='d-flex my-3' lg={12}>
                    <Async
                        renderData={([iou05, iou075, iou09]) => {
                            const classNames = iou05.map((d) => {
                                return d['groundtruth.class_name'];
                            });
                            const bars = classNames.map((name) => ({
                                name,
                                iou05: (iou05.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4),
                                iou075: (iou075.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4),
                                iou09: (iou09.find((i) => {
                                    return i['groundtruth.class_name'] === name;
                                })?.value * 100).toFixed(4)
                            }));

                            return (
                                <BarGraph
                                    bars={bars}
                                    title='Recall'
                                    unit='%'
                                    yAxisName='Recall'
                                    yAxisDomain={[0, 100]}
                                    barGap={1}
                                    barCategoryGap={80}
                                >
                                    <ChartTooltip />
                                    <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                    <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                    <Bar maxBarSize={40} dataKey='iou09' fill={getHexColor('iou09')}/>
                                </BarGraph>
                            );
                        }}
                        refetchOnChanged={[allSqlFilters]}
                        fetchData={[
                            () => metricsClient('/mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.5,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.75,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/mar', {
                                sql_filters: allSqlFilters,
                                model_type: 'DOCUMENT_PROCESSING',
                                iou_threshold: 0.9,
                                group_by: ['groundtruth.class_name']
                            })
                        ]}
                    />
                </div>
            </div>
            <ConfusionMatrix />
            <Segmentation />
        </div>
    );
};

PerformanceDetails.propTypes = {
    benchmarkFilters: PropTypes.string
};

export default PerformanceDetails;
