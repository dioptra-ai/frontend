import React from 'react';
import FilterInput from '../../../components/filter-input';
import {setupComponent} from '../../../helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from '../../../components/progress-bar';
import {getName} from '../../../helpers/name-helper';
import {IconNames} from '../../../constants';
import FontIcon from '../../../components/font-icon';
import ConfusionMatrix from '../../../components/confusion-matrix';
import TimeseriesQuery, {sql} from 'components/timeseries-query';


const PerformanceBox = ({
    title = '',
    mark,
    children
}) => {

    return (
        <div className='border rounded p-3 pb-0'>
            <span className='text-dark fw-bold fs-5'>{title}
            </span>
            {mark && <span className='text-primary mx-1'>{`(n=${mark})`}</span>}
            <div className='d-flex py-3 text-secondary fw-bold border-bottom'>
                <span className='w-100'>Label</span>
                <div className='w-100 d-flex align-items-center'>
                    <span className='d-flex flex-column'>
                        <FontIcon
                            className='text-dark my-1 border-0'
                            icon={IconNames.ARROW_UP}
                            size={5}
                        />
                        <FontIcon
                            className='text-dark my-1 border-0'
                            icon={IconNames.ARROW_DOWN}
                            size={5}
                        />
                    </span>
                    <span className='mx-2'>{title}</span>
                </div>
            </div>
            <div className='py-5'>
                <div className='hide-scrollbar' style={{height: '150px', overflowY: 'scroll'}}>
                    {children}
                </div>
            </div>

        </div>
    );
};

PerformanceBox.propTypes = {
    arrowDownDisabled: PropTypes.bool,
    arrowUpDisabled: PropTypes.bool,
    children: PropTypes.array,
    mark: PropTypes.any,
    onArrowDown: PropTypes.func,
    onArrowUp: PropTypes.func,
    title: PropTypes.string
};

const ClassRow = ({name = '', value}) => {
    return (
        <div className='d-flex align-items-center text-dark class-row'>
            <div className='w-100'>
                {name}
            </div>
            <div className='w-100 d-flex align-items-center'>
                <ProgressBar completed={value / 1 * 100}/>
                <span className='mx-2'>{value}</span>
            </div>
        </div>
    );
};

ClassRow.propTypes = {
    maxValue: PropTypes.number,
    name: PropTypes.string,
    value: PropTypes.any
};


const PerformanceDetails = ({timeStore, filtersStore}) => {
    return (
        <>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Performance per class</h3>
                <Row>
                    <Col lg={6}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <PerformanceBox
                                    mark='21,638'
                                    title='Precision per class'
                                >
                                    {data.sort((c1, c2) => (c1.precision < c2.precision) ? 1 : ((c2.precision < c1.precision) ? -1 : 0)).map((c, i) => (
                                        <ClassRow
                                            key={i}
                                            name={getName(c.label)}
                                            value={c.precision.toFixed(1)}
                                        />
                                    ))}
                                </PerformanceBox>
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
                                <PerformanceBox
                                    mark='21,638'
                                    title='Recall per class'
                                >
                                    {data.sort((c1, c2) => (c1.recall < c2.recall) ? 1 : ((c2.recall < c1.recall) ? -1 : 0)).map((c, i) => (
                                        <ClassRow
                                            key={i}
                                            name={getName(c.label)}
                                            value={c.recall.toFixed(1)}
                                        />
                                    ))}
                                </PerformanceBox>
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
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
            <ConfusionMatrix />
        </>
    );
};

PerformanceDetails.propTypes = {
    errorStore: PropTypes.object.isRequired,
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceDetails);
