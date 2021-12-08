import React, {useEffect, useState} from 'react';
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
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import Segmentation from 'components/segmentation';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import DifferenceLabel from 'components/difference-labels';
import useModel from 'customHooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import Select from 'components/select';
import baseJsonClient from 'clients/base-json-client';
import metricsClient from '../../../clients/metrics';
import Async from 'components/async';
import {precisionRecallData} from './bounding-box-location-analysis-data';
import QAPerfAnalysis from './qa-perf-analysis';

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

const PerformanceDetails = ({filtersStore, timeStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const sqlFiltersWithModelTime = useAllSqlFilters({useReferenceRange: true});
    const [classFilter, setClassFilter] = useState('all_classes');
    const timeGranularity = timeStore.getTimeGranularity().toISOString();
    const [iouFilter, setIouFilter] = useState(0.5);

    const {mlModelType} = useModel();

    const sampleSizeComponent = (
        <TimeseriesQuery
            defaultData={[{sampleSize: 0}]}
            renderData={([{sampleSize}]) => sampleSize}
            renderError={() => 0}
            sql={sql`
                SELECT COUNT(*) as sampleSize 
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${allSqlFilters}`}
        />
    );

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
                                    refetchOnChanged={[allSqlFilters]}
                                    // fetchData={[
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters: allSqlFilters,
                                    //             per_class: false
                                    //         }
                                    //     }),
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters:
                                    //                 sqlFiltersWithModelTime,
                                    //             per_class: false
                                    //         }
                                    //     })
                                    // ]}
                                    fetchData={[
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: allSqlFilters,
                                            per_class: false,
                                            method: 'post'
                                        }),
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: sqlFiltersWithModelTime,
                                            per_class: false,
                                            method: 'post'
                                        })
                                    ]}
                                    renderData={(data) => { // Define method here to select the right metric
                                        let valueToDisplay = 0;

                                        if (data['class_name'] === 'all') {
                                            for (let i = 0; i < data['results'].length; i++) {
                                                if (data[i]['iou'] === '0.5:0.95') {
                                                    valueToDisplay = data[i]['mAP'];
                                                }
                                            }
                                        }

                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={valueToDisplay}
                                            difference={valueToDisplay}
                                        />;
                                    }}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    refetchOnChanged={[allSqlFilters]}
                                    // fetchData={[
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters: allSqlFilters,
                                    //             per_class: false
                                    //         }
                                    //     }),
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters:
                                    //                 sqlFiltersWithModelTime,
                                    //             per_class: false
                                    //         }
                                    //     })
                                    // ]}
                                    fetchData={[
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: allSqlFilters,
                                            per_class: false,
                                            method: 'post'
                                        }),
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: sqlFiltersWithModelTime,
                                            per_class: false,
                                            method: 'post'
                                        })
                                    ]}
                                    renderData={(data) => {
                                        let valueToDisplay = 0;

                                        if (data['class_name'] === 'all') {
                                            for (let i = 0; i < data['results'].length; i++) {
                                                if (data[i]['iou'] === '0.5') {
                                                    valueToDisplay = data[i]['mAP'];
                                                }
                                            }
                                        }

                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={valueToDisplay}
                                            difference={valueToDisplay}
                                        />;
                                    }}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    refetchOnChanged={[allSqlFilters]}
                                    // fetchData={[
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters: allSqlFilters,
                                    //             per_class: false
                                    //         }
                                    //     }),
                                    //     () => baseJsonClient('/api/metrics', {
                                    //         method: 'post',
                                    //         body: {
                                    //             metrics_type: 'map_mar',
                                    //             current_filters:
                                    //                 sqlFiltersWithModelTime,
                                    //             per_class: false
                                    //         }
                                    //     })
                                    // ]}
                                    fetchData={[
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: allSqlFilters,
                                            per_class: false,
                                            method: 'post'
                                        }),
                                        () => metricsClient('compute', {
                                            metrics_type: 'map_mar',
                                            current_filters: sqlFiltersWithModelTime,
                                            per_class: false,
                                            method: 'post'
                                        })
                                    ]}
                                    renderData={(data) => {
                                        let valueToDisplay = 0;

                                        if (data['class_name'] === 'all') {
                                            for (let i = 0; i < data['results'].length; i++) {
                                                if (data[i]['iou'] === '0.75') {
                                                    valueToDisplay = data[i]['mAP'];
                                                }
                                            }
                                        }

                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={valueToDisplay}
                                            difference={valueToDisplay}
                                        />;
                                    }}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AP'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    refetchOnChanged={[allSqlFilters]}
                                    fetchData={[
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters: allSqlFilters,
                                                per_class: false
                                            }
                                        }),
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters:
                                                    sqlFiltersWithModelTime,
                                                per_class: false
                                            }
                                        })
                                    ]}
                                    renderData={(data) => (
                                        // Parse 'data' for the exact value we need
                                        // Turn this into a function where we determine which piece of data to pickup
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={data}
                                            difference={data}
                                        />
                                    )}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    refetchOnChanged={[allSqlFilters]}
                                    fetchData={[
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters: allSqlFilters,
                                                per_class: false
                                            }
                                        }),
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters:
                                                    sqlFiltersWithModelTime,
                                                per_class: false
                                            }
                                        })
                                    ]}
                                    renderData={(data) => (
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={data}
                                            difference={data}
                                        />
                                    )}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <Async
                                    refetchOnChanged={[allSqlFilters]}
                                    fetchData={[
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters: allSqlFilters,
                                                per_class: false
                                            }
                                        }),
                                        () => baseJsonClient('/api/metrics', {
                                            method: 'post',
                                            body: {
                                                metrics_type: 'map_mar',
                                                current_filters:
                                                    sqlFiltersWithModelTime,
                                                per_class: false
                                            }
                                        })
                                    ]}
                                    renderData={(data) => (
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={data}
                                            difference={data}
                                        />
                                    )}
                                    renderError={() => (
                                        <MetricInfoBox
                                            name='AR'
                                            sampleSize={sampleSizeComponent}
                                            unit='%'
                                            value={0.0}
                                            difference={0.0}
                                        />
                                    )}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className='my-3'>
                        <div className='d-flex my-3' lg={12}>
                            <TimeseriesQuery
                                defaultData={[]}
                                renderData={() => (
                                    <BarGraph
                                        bars={[]}
                                        title='Precision'
                                        unit='%'
                                        yAxisName='Precision'
                                        xAxisName={[
                                            'SSN',
                                            'First Name',
                                            'Last Name',
                                            'Zip Code'
                                        ]}
                                    />
                                )}
                                sql={sql`SELECT 1 as "one"`}
                            />
                        </div>
                        <div className='d-flex my-3' lg={12}>
                            <TimeseriesQuery
                                defaultData={[]}
                                renderData={() => (
                                    <BarGraph
                                        bars={[]}
                                        title='Recall'
                                        unit='%'
                                        yAxisName='Recall'
                                        xAxisName={[
                                            'SSN',
                                            'First Name',
                                            'Last Name',
                                            'Zip Code'
                                        ]}
                                    />
                                )}
                                sql={sql`SELECT 1 as "one"`}
                            />
                        </div>
                        <div className='d-flex my-3' lg={12}>
                            <Async
                                refetchOnChanged={[
                                    iouFilter,
                                    classFilter,
                                    allSqlFilters,
                                    timeGranularity
                                ]}
                                fetchData={[
                                    () => baseJsonClient(
                                        '/api/metrics/precision_recall',
                                        {
                                            method: 'post',
                                            body: {
                                                prediction: classFilter,
                                                iou: iouFilter,
                                                current_filters: allSqlFilters,
                                                time_granularity: timeGranularity
                                            }
                                        }
                                    ),
                                    () => baseJsonClient(
                                        '/api/metrics/precision_recall1',
                                        {
                                            method: 'post',
                                            body: {
                                                prediction: classFilter,
                                                iou: iouFilter,
                                                current_filters: allSqlFilters,
                                                time_granularity: timeGranularity
                                            }
                                        }
                                    )
                                ]}
                                renderData={(data) => (
                                    <AreaGraph
                                        dots={data.map(
                                            ({precision, recall}) => ({
                                                x: recall,
                                                y: precision
                                            })
                                        )}
                                        title={(
                                            <Row>
                                                <Col>
                                                    Precision Recall Curve
                                                </Col>
                                                <Col lg={3} className='my-3'>
                                                    <Select
                                                        options={[
                                                            {name: 'All Classes', value: 'all_classes'},
                                                            {name: 'SSN', value: 'ssn'},
                                                            {name: 'First Name', value: 'first_name'},
                                                            {name: 'Last Name', value: 'last_name'},
                                                            {name: 'Zip Code', value: 'zip_code'}
                                                        ]}
                                                        initialValue={classFilter}
                                                        onChange={setClassFilter}
                                                    />
                                                </Col>
                                                <Col lg={3} className='my-3'>
                                                    <Select
                                                        options={[
                                                            {name: 'iou >= 0.5', value: 0.5},
                                                            {name: 'iou >= 0.75', value: 0.75},
                                                            {name: 'iou >= 0.95', value: 0.95}
                                                        ]}
                                                        initialValue={iouFilter}
                                                        onChange={(val) => {
                                                            setIouFilter(Number(val));
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        )}
                                        xAxisName='Recall'
                                        yAxisName='Precision'
                                        hasBorder={false}
                                    />
                                )}
                                // Will be removed after API is working
                                renderError={() => (
                                    <AreaGraph
                                        dots={precisionRecallData.map(
                                            ({precision, recall}) => ({
                                                x: recall,
                                                y: precision
                                            })
                                        )}
                                        title={(
                                            <Row>
                                                <Col className='d-flex align-items-center'>
                                                    Precision Recall Curve
                                                </Col>
                                                <Col lg={3} className='my-3'>
                                                    <Select
                                                        options={[
                                                            {name: 'All Classes', value: 'all_classes'},
                                                            {name: 'SSN', value: 'ssn'},
                                                            {name: 'First Name', value: 'first_name'},
                                                            {name: 'Last Name', value: 'last_name'},
                                                            {name: 'Zip Code', value: 'zip_code'}
                                                        ]}
                                                        initialValue={classFilter}
                                                        onChange={setClassFilter}
                                                    />
                                                </Col>
                                                <Col lg={3} className='my-3'>
                                                    <Select
                                                        options={[
                                                            {name: 'iou >= 0.5', value: 0.5},
                                                            {name: 'iou >= 0.75', value: 0.75},
                                                            {name: 'iou >= 0.95', value: 0.95}
                                                        ]}
                                                        initialValue={iouFilter}
                                                        onChange={(val) => {
                                                            setIouFilter(Number(val));
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        )}
                                        xAxisName='Recall'
                                        yAxisName='Precision'
                                    />
                                )}
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
                            <TimeseriesQuery
                                defaultData={[[], []]}
                                renderData={([data, diffData]) => (
                                    <PerformanceBox
                                        data={data}
                                        performanceType='precision'
                                        sampleSize={sampleSizeComponent}
                                        title='Precision per class'
                                        diffData={diffData}
                                    />
                                )}
                                sql={[
                                    sql`
                            WITH
                            true_positive as (
                            select
                                'true_positive' as key,
                                groundtruth as label,
                                sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by groundtruth
                            order by groundtruth
                            ),
                            true_sum as (
                            select
                                'true_sum' as key,
                                prediction as label,
                                count(1) as cnt_ts
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by prediction
                            order by prediction
                            ),
                            pred_sum as (
                            select
                                'pred_sum' as key,
                                groundtruth as label,
                                count(1) as cnt_ps
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by groundtruth
                            order by groundtruth
                            )
            
                            SELECT
                            pred_sum.label,
                            cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps as "precision"
                            FROM true_positive
                            JOIN pred_sum
                            ON pred_sum.label = true_positive.label
                        `,
                                    sql`
                        WITH
                        true_positive as (
                        select
                            'true_positive' as key,
                            groundtruth as label,
                            sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by groundtruth
                        order by groundtruth
                        ),
                        true_sum as (
                        select
                            'true_sum' as key,
                            prediction as label,
                            count(1) as cnt_ts
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by prediction
                        order by prediction
                        ),
                        pred_sum as (
                        select
                            'pred_sum' as key,
                            groundtruth as label,
                            count(1) as cnt_ps
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by groundtruth
                        order by groundtruth
                        )
        
                        SELECT
                        pred_sum.label,
                        cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps as "precision"
                        FROM true_positive
                        JOIN pred_sum
                        ON pred_sum.label = true_positive.label
                    `
                                ]}
                            />
                        </Col>
                        <Col lg={6}>
                            <TimeseriesQuery
                                defaultData={[[], []]}
                                renderData={([data, diffData]) => (
                                    <PerformanceBox
                                        data={data}
                                        performanceType='recall'
                                        sampleSize={sampleSizeComponent}
                                        title='Recall per class'
                                        diffData={diffData}
                                    />
                                )}
                                sql={[
                                    sql`
                            WITH
                            true_positive as (
                            select
                                'true_positive' as key,
                                groundtruth as label,
                                sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by groundtruth
                            order by groundtruth
                            ),
                            true_sum as (
                            select
                                'true_sum' as key,
                                prediction as label,
                                count(1) as cnt_ts
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by prediction
                            order by prediction
                            ),
                            pred_sum as (
                            select
                                'pred_sum' as key,
                                groundtruth as label,
                                count(1) as cnt_ps
                            from
                                "dioptra-gt-combined-eventstream"
                            WHERE ${allSqlFilters}
                            group by groundtruth
                            order by groundtruth
                            )
            
                            SELECT
                            true_sum.label,
                            cast(true_positive.cnt_tp as double) / true_sum.cnt_ts as "recall"
                            FROM true_positive
                            JOIN true_sum
                            ON true_sum.label = true_positive.label
                        `,
                                    sql`
                        WITH
                        true_positive as (
                        select
                            'true_positive' as key,
                            groundtruth as label,
                            sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by groundtruth
                        order by groundtruth
                        ),
                        true_sum as (
                        select
                            'true_sum' as key,
                            prediction as label,
                            count(1) as cnt_ts
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by prediction
                        order by prediction
                        ),
                        pred_sum as (
                        select
                            'pred_sum' as key,
                            groundtruth as label,
                            count(1) as cnt_ps
                        from
                            "dioptra-gt-combined-eventstream"
                        WHERE ${sqlFiltersWithModelTime}
                        group by groundtruth
                        order by groundtruth
                        )
        
                        SELECT
                        true_sum.label,
                        cast(true_positive.cnt_tp as double) / true_sum.cnt_ts as "recall"
                        FROM true_positive
                        JOIN true_sum
                        ON true_sum.label = true_positive.label
                    `
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
