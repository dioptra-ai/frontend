import React from 'react';
import {Bar, Tooltip as ChartTooltip} from 'recharts';
import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import {getHexColor} from 'helpers/color-helper';

const UnsupervisedObjectDetection = ({filtersStore, benchmarkFilters}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;

    // This is ugly. Should find a better way to do it
    const d = new Date();

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
        <div className='pb-5'>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />

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
                                model_type: mlModelType,
                                iou_threshold: 0.5,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/map', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType,
                                iou_threshold: 0.75,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/map', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType,
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
                                model_type: mlModelType,
                                iou_threshold: 0.5,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/mar', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType,
                                iou_threshold: 0.75,
                                group_by: ['groundtruth.class_name']
                            }),
                            () => metricsClient('/mar', {
                                sql_filters: allSqlFilters,
                                model_type: mlModelType,
                                iou_threshold: 0.9,
                                group_by: ['groundtruth.class_name']
                            })
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

UnsupervisedObjectDetection.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    benchmarkFilters: PropTypes.string
};

export default setupComponent(UnsupervisedObjectDetection);
