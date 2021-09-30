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
            {sampleSize && <span className='text-primary mx-1'>(n={sampleSize})</span>}
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
                        const classReferenceData = referenceData.find(({label}) => label === c.label);
                        const classReferenceMetric = classReferenceData?.[performanceType];
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

    const sampleSizeComponent = (
        <TimeseriesQuery
            defaultData={[{sampleSize: 0}]}
            renderData={([{sampleSize}]) => sampleSize}
            sql={sql`
                SELECT COUNT(*) as sampleSize 
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${allSqlFilters}`}
        />
    );

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            {mlModelType === 'DOCUMENT_PROCESSING' ? (
                <>
                    <div className='my-5'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>Overview</h3>
                        <Row className='mb-3 align-items-stretch'>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={(referenceData) => (
                                        <PerformanceBox
                                            data={data}
                                            performanceType='precision'
                                            sampleSize={sampleSizeComponent}
                                            title='Precision per class'
                                            referenceData={referenceData}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={(referenceData) => (
                                        <PerformanceBox
                                            data={data}
                                            performanceType='recall'
                                            sampleSize={sampleSizeComponent}
                                            title='Recall per class'
                                            referenceData={referenceData}

                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <TimeseriesQuery
                                            defaultData={[]}
                                            renderData={() => (
                                                <MetricInfoBox
                                                    name='AP'
                                                    sampleSize={sampleSizeComponent}
                                                    unit='%'
                                                    value={0.0}
                                                    difference={0.0}
                                                />
                                            )}
                                            sql={sql`SELECT 1 as "one"`}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <TimeseriesQuery
                                            defaultData={[]}
                                            renderData={() => (
                                                <MetricInfoBox
                                                    name='AR'
                                                    sampleSize={sampleSizeComponent}
                                                    unit='%'
                                                    value={0.0}
                                                    difference={0.0}
                                                />
                                            )}
                                            sql={sql`SELECT 1 as "one"`}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <TimeseriesQuery
                                            defaultData={[]}
                                            renderData={() => (
                                                <MetricInfoBox
                                                    name='AR'
                                                    sampleSize={sampleSizeComponent}
                                                    unit='%'
                                                    value={0.0}
                                                    difference={0.0}
                                                />
                                            )}
                                            sql={sql`SELECT 1 as "one"`}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={2}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <TimeseriesQuery
                                            defaultData={[]}
                                            renderData={() => (
                                                <MetricInfoBox
                                                    name='AR'
                                                    sampleSize={sampleSizeComponent}
                                                    unit='%'
                                                    value={0.0}
                                                    difference={0.0}
                                                />
                                            )}
                                            sql={sql`SELECT 1 as "one"`}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className='my-5'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>Class Breakdown</h3>
                        <Row className='my-5 mx-2 border rounded'>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <BarGraph
                                            bars={[]}
                                            title='Precision'
                                            unit='%'
                                            yAxisName='Precision'
                                            xAxisName='SSN'
                                            className='border-0'
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <BarGraph
                                            bars={[]}
                                            title=' '
                                            unit='%'
                                            xAxisName='First Name'
                                            className='border-0'
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <BarGraph
                                            bars={[]}
                                            title=' '
                                            unit='%'
                                            xAxisName='Last Name'
                                            className='border-0'
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={3}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={() => (
                                        <BarGraph
                                            bars={[]}
                                            title=' '
                                            unit='%'
                                            xAxisName='Zip Code'
                                            className='border-0'
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                        </Row>
                    </div>
                </>
            ) : (
                <div className='my-5'>
                    <h3 className='text-dark bold-text fs-3 mb-3'>Performance per class</h3>
                    <Row>
                        <Col lg={6}>
                            <TimeseriesQuery
                                defaultData={[]}
                                renderData={(data) => (
                                    <TimeseriesQuery
                                        defaultData={[]}
                                        renderData={(diffData) => (
                                            <PerformanceBox
                                                data={data}
                                                performanceType='precision'
                                                sampleSize={sampleSizeComponent}
                                                title='Precision per class'
                                                diffData={diffData}
                                            />
                                        )}
                                        sql={sql`
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
                        `}
                                    />
                                )}
                                sql={sql`
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
                        `}
                            />
                        </Col>
                        <Col lg={6}>
                            <TimeseriesQuery
                                defaultData={[]}
                                renderData={(data) => (
                                    <TimeseriesQuery
                                        defaultData={[]}
                                        renderData={(diffData) => (
                                            <PerformanceBox
                                                data={data}
                                                performanceType='recall'
                                                sampleSize={sampleSizeComponent}
                                                title='Recall per class'
                                                diffData={diffData}
                                            />
                                        )}
                                        sql={sql`
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
                        `}
                                    />
                                )}
                                sql={sql`
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
                        `}
                            />
                        </Col>
                    </Row>
                </div>
            )}
            <ConfusionMatrix />
            <Segmentation />
        </>
    );
};

PerformanceDetails.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceDetails);
