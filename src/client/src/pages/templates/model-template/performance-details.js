import React, {useEffect, useState} from 'react';
import FilterInput from '../../../components/filter-input';
import {setupComponent} from '../../../helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from '../../../components/progress-bar';
import timeseriesClient from 'clients/timeseries';
import {getName} from '../../../helpers/name-helper';
import {IconNames} from '../../../constants';
import BtnIcon from '../../../components/btn-icon';
import ConfusionMatrix from '../../../components/confusion-matrix';

const PerformanceBox = ({
    title = '',
    mark,
    onArrowUp,
    onArrowDown,
    arrowUpDisabled,
    arrowDownDisabled,
    children
}) => {
    return (
        <div className='border rounded p-3'>
            <span className='text-dark fw-bold fs-5'>{title}
            </span>
            {mark && <span className='text-primary mx-1'>{`(n=${mark})`}</span>}
            <div className='d-flex py-3 text-secondary fw-bold border-bottom'>
                <span className='w-100'>Label</span>
                <div className='w-100 d-flex align-items-center'>
                    <span className='d-flex flex-column'>
                        <BtnIcon
                            className='text-dark my-1 border-0'
                            disabled={arrowUpDisabled}
                            icon={IconNames.ARROW_UP}
                            onClick={onArrowUp}
                            size={5}
                        />
                        <BtnIcon
                            className='text-dark my-1 border-0'
                            disabled={arrowDownDisabled}
                            icon={IconNames.ARROW_DOWN}
                            onClick={onArrowDown}
                            size={5}
                        />
                    </span>
                    <span className='mx-2'>{title}</span>
                </div>
            </div>
            {children}
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
        <div className='d-flex align-items-center my-5 text-dark'>
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


const PerformanceDetails = ({errorStore, timeStore, filtersStore}) => {
    const [precisionClasses, setPrecisionClasses] = useState([]);
    const [visiblePrecisionClasses, setVisiblePrecisionClasses] = useState([]);
    const [precisionIndex, setPrecisionIndex] = useState(null);
    const [recallClasses, setRecallClasses] = useState([]);
    const [visibleRecallClasses, setVisibleRecallClasses] = useState([]);
    const [recallIndex, setRecallIndex] = useState(null);

    useEffect(() => {
        timeseriesClient({
            query: `
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
            `
        }).then((res) => {
            setPrecisionClasses(res);
            setPrecisionIndex(0);
        }).catch((e) => errorStore.reportError(e));
    }, [timeStore.sqlTimeFilter, filtersStore.sqlFilters]);

    useEffect(() => {
        setVisiblePrecisionClasses(precisionClasses.slice(precisionIndex, precisionIndex + 3));
    }, [precisionIndex, precisionClasses]);

    useEffect(() => {
        timeseriesClient({
            query: `
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
            `
        }).then((res) => {
            setRecallClasses(res);
            setRecallIndex(0);
        }).catch((e) => errorStore.reportError(e));
    }, [timeStore.sqlTimeFilter, filtersStore.sqlFilters]);

    useEffect(() => {
        setVisibleRecallClasses(recallClasses.slice(recallIndex, recallIndex + 3));
    }, [recallIndex, recallClasses]);

    return (
        <>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Performance per class</h3>
                <Row>
                    <Col lg={6}>
                        <PerformanceBox
                            arrowDownDisabled={precisionIndex >= precisionClasses.length - 3}
                            arrowUpDisabled={precisionIndex === 0}
                            mark='21,638'
                            onArrowDown={() => setPrecisionIndex(precisionIndex + 1)}
                            onArrowUp={() => setPrecisionIndex(precisionIndex - 1)}
                            title='Precision per class'
                        >
                            {visiblePrecisionClasses.map((c, i) => (
                                <ClassRow
                                    key={i}
                                    name={getName(c.label)}
                                    value={c.precision.toFixed(1)}
                                />
                            ))}
                        </PerformanceBox>
                    </Col>
                    <Col lg={6}>
                        <PerformanceBox
                            arrowDownDisabled={recallIndex >= precisionClasses.length - 3}
                            arrowUpDisabled={recallIndex === 0}
                            mark='21,638'
                            onArrowDown={() => setRecallIndex(recallIndex + 1)}
                            onArrowUp={() => setRecallIndex(recallIndex - 1)}
                            title='Recall per class'
                        >
                            {visibleRecallClasses.map((c, i) => (
                                <ClassRow
                                    key={i}
                                    name={getName(c.label)}
                                    value={c.recall.toFixed(1)}
                                />
                            ))}
                        </PerformanceBox>
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
