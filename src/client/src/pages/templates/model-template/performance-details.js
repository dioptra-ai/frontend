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

const PerformanceBox = ({
    title = '',
    sampleSize,
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
            {sampleSize && (
                <span className='text-primary mx-1'>(n={sampleSize})</span>
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
    sampleSize: PropTypes.any,
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
                    baseClasses='mx-2'
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

    return (
        <div className='pb-5'>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            {mlModelType === 'DOCUMENT_PROCESSING' ? (
                <>
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
                                        iou_threshold: 0.95
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAP'
                                            subtext={'iou=0.95'}
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
                                        iou_threshold: 0.95
                                    })}
                                    refetchOnChanged={[allSqlFilters]}
                                    renderData={([d]) => (
                                        <MetricInfoBox
                                            name='mAR'
                                            subtext={'iou=0.95'}
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
                                renderData={([iou05, iou075, iou095]) => {
                                    const classNames = iou05.map((d) => {

                                        return d['groundtruth.class_name'];
                                    });
                                    const bars = classNames.map((name) => ({
                                        name,
                                        iou05: iou05.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value,
                                        iou075: iou075.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value,
                                        iou095: iou095.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value
                                    }));

                                    return (
                                        <BarGraph
                                            bars={bars}
                                            title='Precision'
                                            unit='%'
                                            yAxisName='Precision'
                                        >
                                            <Tooltip />
                                            <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                            <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                            <Bar maxBarSize={40} dataKey='iou095' fill={getHexColor('iou095')}/>
                                        </BarGraph>
                                    );
                                }}
                                refetchOnChanged={[allSqlFilters]}
                                fetchData={[
                                    () => metricsClient('/precision-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.5`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    }),
                                    () => metricsClient('/precision-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.75`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    }),
                                    () => metricsClient('/precision-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.95`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    })
                                ]}
                            />
                        </div>
                        <div className='d-flex my-3' lg={12}>
                            <Async
                                renderData={([iou05, iou075, iou095]) => {
                                    const classNames = iou05.map((d) => {

                                        return d['groundtruth.class_name'];
                                    });
                                    const bars = classNames.map((name) => ({
                                        name,
                                        iou05: iou05.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value,
                                        iou075: iou075.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value,
                                        iou095: iou095.find((i) => {
                                            return i['groundtruth.class_name'] === name;
                                        })?.value
                                    }));

                                    return (
                                        <BarGraph
                                            bars={bars}
                                            title='Recall'
                                            unit='%'
                                            yAxisName='Recall'
                                        >
                                            <Tooltip />
                                            <Bar maxBarSize={40} dataKey='iou05' fill={getHexColor('iou05')}/>
                                            <Bar maxBarSize={40} dataKey='iou075' fill={getHexColor('iou075')}/>
                                            <Bar maxBarSize={40} dataKey='iou095' fill={getHexColor('iou095')}/>
                                        </BarGraph>
                                    );
                                }}
                                refetchOnChanged={[allSqlFilters]}
                                fetchData={[
                                    () => metricsClient('/recall-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.5`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    }),
                                    () => metricsClient('/recall-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.75`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    }),
                                    () => metricsClient('/recall-metric', {
                                        sql_filters: `${allSqlFilters} AND iou >= 0.95`,
                                        model_type: mlModelType,
                                        group_by: ['groundtruth.class_name']
                                    })
                                ]}
                            />
                        </div>
                    </div>
                </>
            ) : mlModelType === 'Q_N_A' ? (
                <div>
                    <Row>
                        <Col>
                            <QAPerfAnalysis/>
                        </Col>
                    </Row>
                </div>
            ) : (
                <div className='my-5'>
                    <h3 className='text-dark bold-text fs-3 mb-3'>
                        Performance per class
                    </h3>
                    <Row>
                        <Col lg={6}>
                            <Async
                                defaultData={[[], []]}
                                renderData={([data, diffData]) => (
                                    <PerformanceBox
                                        data={data}
                                        performanceType='precision'
                                        subtext={sampleSizeComponent}
                                        title='Precision per class'
                                        diffData={diffData}
                                    />
                                )}
                                fetchData={[
                                    () => metricsClient('query/precision-per-class', {sql_filters: allSqlFilters}),
                                    () => metricsClient('query/precision-per-class', {sql_filters: sqlFiltersWithModelTime})
                                ]}
                            />
                        </Col>
                        <Col lg={6}>
                            <Async
                                defaultData={[[], []]}
                                renderData={([data, diffData]) => (
                                    <PerformanceBox
                                        data={data}
                                        performanceType='recall'
                                        subtext={sampleSizeComponent}
                                        title='Recall per class'
                                        diffData={diffData}
                                    />
                                )}
                                fetchData={[
                                    () => metricsClient('query/recall-per-class', {sql_filters: allSqlFilters}),
                                    () => metricsClient('query/recall-per-class', {sql_filters: sqlFiltersWithModelTime})
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            )}
            {mlModelType !== 'Q_N_A' ? <ConfusionMatrix /> : null}
            {mlModelType !== 'Q_N_A' ? <Segmentation /> : null}
        </div>
    );
};

PerformanceDetails.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceDetails);
