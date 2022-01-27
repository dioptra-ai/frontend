import React, {useEffect, useState} from 'react';
import {Bar, Tooltip} from 'recharts';
import FilterInput from 'components/filter-input';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'components/progress-bar';
import {getName} from 'helpers/name-helper';
import {IconNames} from 'constants';
import FontIcon from 'components/font-icon';
import ConfusionMatrix from 'components/confusion-matrix';
import Segmentation from 'components/segmentation';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import DifferenceLabel from 'components/difference-labels';
import useModel from 'customHooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import QAPerfAnalysis from './qa-perf-analysis';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import {getHexColor} from 'helpers/color-helper';
import useTimeGranularity from 'customHooks/use-time-granularity';

const PerformanceBox = ({
    title = '',
    subtext,
    data,
    referenceData,
    performanceType
}) => {
    const [sortAcs, setSortAsc] = useState(true);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (sortAcs) {
            setClasses([
                ...data.sort((c1, c2) => c2[performanceType] - c1[performanceType])
            ]);
        } else {
            setClasses([
                ...data.sort((c1, c2) => c1[performanceType] - c2[performanceType])
            ]);
        }
    }, [sortAcs, data]);

    return (
        <div className='border rounded p-3 pb-0'>
            <span className='text-dark bold-text fs-5'>{title}</span>
            {subtext && (
                <span className='text-primary mx-1'>(n={subtext})</span>
            )}
            <div className='d-flex py-3 text-secondary bold-text border-bottom'>
                <span className='w-100'>Label</span>
                <div
                    className='w-100 d-flex align-items-center'
                    onClick={() => setSortAsc(!sortAcs)}
                    style={{cursor: 'pointer'}}
                >
                    <span className='d-flex flex-column'>
                        <FontIcon
                            className='text-muted my-1 border-0'
                            icon={IconNames.ARROW_UP}
                            size={5}
                        />
                        <FontIcon
                            className='text-muted my-1 border-0'
                            icon={IconNames.ARROW_DOWN}
                            size={5}
                        />
                    </span>
                    <span className='mx-2'>{title}</span>
                </div>
            </div>
            <div className='py-5'>
                <div
                    style={{
                        height: '150px',
                        overflowY: 'scroll',
                        position: 'relative',
                        left: 10,
                        paddingRight: 10,
                        marginLeft: -10
                    }}
                >
                    {classes.map((c, i) => {
                        const classMetric = c[performanceType];
                        const classReferenceData = referenceData?.find(
                            ({label}) => label === c.label
                        );
                        const classReferenceMetric =
                            classReferenceData?.[performanceType];
                        const difference = classMetric - classReferenceMetric;

                        return (
                            <ClassRow
                                key={i}
                                name={getName(c.label)}
                                value={c[performanceType].toFixed(1)}
                                difference={difference}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

PerformanceBox.propTypes = {
    data: PropTypes.array,
    referenceData: PropTypes.array,
    performanceType: PropTypes.string,
    subtext: PropTypes.node,
    title: PropTypes.string
};

const ClassRow = ({name = '', value, difference = 0}) => {
    return (
        <div className='d-flex align-items-center text-dark class-row'>
            <div className='w-100'>{name}</div>
            <div className='w-100 d-flex align-items-center'>
                <ProgressBar completed={(value / 1) * 100} />
                <DifferenceLabel
                    value={value}
                    difference={difference.toFixed(2)}
                    diffStyles={{position: 'static'}}
                />
            </div>
        </div>
    );
};

ClassRow.propTypes = {
    difference: PropTypes.number,
    maxValue: PropTypes.number,
    name: PropTypes.string,
    value: PropTypes.any
};

const PerformanceDetails = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const timeGranularity = useTimeGranularity()?.toISOString();

    // This is ugly. Should find a better way to do it
    const d = new Date();

    d.setDate(d.getDate() - 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    const allReferenceFilters = `${allSqlFilters
        .replace(/\("dataset_id"=[^)]+\)/, '')
        .replace(/\("model_version"=[^)]+\)/, '')
        .replace(/\("benchmark_id"=[^)]+\)/, '')
        .replace(/AND(\s+AND)+/g, 'AND')
    } AND __time >= '${d.toISOString()}'`;

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
                    {
                        mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? (
                            <>
                                <Col className='d-flex' lg={3}>
                                    <Async
                                        fetchData={() => metricsClient('compute', {
                                            metrics_type: 'outlier_detection',
                                            current_filters: allSqlFilters,
                                            reference_filters: allReferenceFilters
                                        })}
                                        refetchOnChanged={[allSqlFilters]}
                                        renderData={(data) => {
                                            const noveltyNum = data?.outlier_analysis?.filter((d) => d.novelty).length;

                                            return (
                                                <MetricInfoBox
                                                    name='Obsolete'
                                                    value={100 * noveltyNum / data?.outlier_analysis.length}
                                                    unit='%'
                                                />
                                            );
                                        }}
                                    />
                                </Col>
                                <Col className='d-flex' lg={3}>
                                    <Async
                                        fetchData={() => metricsClient('map', {
                                            sql_filters: allSqlFilters,
                                            time_granularity: timeGranularity,
                                            model_type: mlModelType,
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
                                <Col className='d-flex' lg={3}>
                                    <Async
                                        fetchData={() => metricsClient('mar', {
                                            sql_filters: allSqlFilters,
                                            time_granularity: timeGranularity,
                                            model_type: mlModelType,
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
                            </>
                        ) : mlModelType === 'SPEECH_TO_TEXT' ? (
                            <>
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
                                                name='EM'
                                                value={d?.value}
                                            />
                                        )}
                                    />
                                </Col>
                                <Col className='d-flex' lg={3}>
                                    <Async
                                        fetchData={() => metricsClient('word-error-rate', {
                                            sql_filters: allSqlFilters,
                                            time_granularity: timeGranularity,
                                            model_type: mlModelType
                                        })}
                                        refetchOnChanged={[allSqlFilters]}
                                        renderData={([d]) => (
                                            <MetricInfoBox
                                                name='WER'
                                                value={d?.value}
                                            />
                                        )}
                                    />
                                </Col>
                            </>
                        ) : null
                    }
                </Row>
            </div>
            {
                mlModelType === 'DOCUMENT_PROCESSING' ? (
                    <div className='my-3'>
                        <Row className='mb-3 align-items-stretch'>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('map', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.5
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAP'
                                            subtext={'iou=0.5'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('map', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.75
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAP'
                                            subtext={'iou=0.75'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('map', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.9
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAP'
                                            subtext={'iou=0.9'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('mar', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.5
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAR'
                                            subtext={'iou=0.5'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('mar', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.75
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAR'
                                            subtext={'iou=0.75'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    fetchData={() => metricsClient('mar', {
                                        sql_filters: allSqlFilters,
                                        model_type: mlModelType,
                                        iou_threshold: 0.9
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAR'
                                            subtext={'iou=0.9'}
                                            value={d?.value}
                                        />
                                    )}
                                />
                            </Col>
                        </Row>
                    </div>
                ) : null}
            {
                mlModelType === 'DOCUMENT_PROCESSING' || mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ? (
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
                                            barGap={1}
                                            barCategoryGap={80}
                                        >
                                            <Tooltip />
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
                                            barGap={1}
                                            barCategoryGap={80}
                                        >
                                            <Tooltip />
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
                ) : mlModelType === 'Q_N_A' ? (
                    <div>
                        <Row>
                            <Col>
                                <QAPerfAnalysis/>
                            </Col>
                        </Row>
                    </div>
                ) : mlModelType === 'SPEECH_TO_TEXT' ? (
                    null
                ) : (
                    <div className='my-5'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>
                        Performance per class
                        </h3>
                        <Row>
                            <Col lg={6}>
                                <Async
                                    defaultData={[[], []]}
                                    renderData={([data, referenceData]) => (
                                        <PerformanceBox
                                            data={data}
                                            performanceType='precision'
                                            subtext={sampleSizeComponent}
                                            title='Precision per class'
                                            referenceData={referenceData}
                                        />
                                    )}
                                    fetchData={[
                                        () => metricsClient('queries/precision-per-class', {sql_filters: allSqlFilters}),
                                        () => metricsClient('queries/precision-per-class', {sql_filters: sqlFiltersWithModelTime})
                                    ]}
                                    refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                                />
                            </Col>
                            <Col lg={6}>
                                <Async
                                    defaultData={[[], []]}
                                    renderData={([data, referenceData]) => (
                                        <PerformanceBox
                                            data={data}
                                            performanceType='recall'
                                            subtext={sampleSizeComponent}
                                            title='Recall per class'
                                            referenceData={referenceData}
                                        />
                                    )}
                                    fetchData={[
                                        () => metricsClient('queries/recall-per-class', {sql_filters: allSqlFilters}),
                                        () => metricsClient('queries/recall-per-class', {sql_filters: sqlFiltersWithModelTime})
                                    ]}
                                    refetchOnChanged={[allSqlFilters, sqlFiltersWithModelTime]}
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            {mlModelType === 'TEXT_CLASSIFIER' ? (
                <div>
                    <h3 className='text-dark bold-text fs-3 mb-3'>
                            Groundtruth distribution
                    </h3>
                    <Row>
                        <Col lg={6}>
                            <Async
                                refetchOnChanged={[allSqlFilters]}
                                renderData={(data) => (
                                    <BarGraph
                                        bars={data.map(({groundtruth, my_percentage}) => ({
                                            name: getName(groundtruth),
                                            value: my_percentage,
                                            fill: getHexColor(groundtruth)
                                        }))}
                                        title='Groundtruth Distribution'
                                        unit='%'
                                    />
                                )}
                                fetchData={() => metricsClient('gt-distribution', {
                                    sql_filters: allSqlFilters,
                                    model_type: mlModelType
                                })}
                            />
                        </Col>
                    </Row>
                </div>
            ) : null}
            {(mlModelType !== 'Q_N_A' && mlModelType !== 'SPEECH_TO_TEXT') ? <ConfusionMatrix /> : null}
            {(mlModelType !== 'Q_N_A') ? <Segmentation /> : null}
        </div>
    );
};

PerformanceDetails.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceDetails);
