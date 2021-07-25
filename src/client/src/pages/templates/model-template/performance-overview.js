/* eslint-disable max-lines */
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import FilterInput from '../../../components/filter-input';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AreaGraph from '../../../components/area-graph';
import {formatDateTime} from '../../../helpers/date-helper';
import moment from 'moment';
import Select from '../../../components/select';
import FontIcon from '../../../components/font-icon';
import {IconNames} from '../../../constants';
import {Link} from 'react-router-dom';
import {Paths} from '../../../configs/route-config';
import {setupComponent} from '../../../helpers/component-helper';
import timeseriesClient from 'clients/timeseries';

const ModelPerformanceMetrics = {
    ACCURACY: {value: 'ACCURACY', name: 'Accuracy'},
    F1_SCORE: {value: 'F1_SCORE', name: 'F1 Score'},
    PRECISION: {value: 'PRECISION', name: 'Precision'},
    RECALL: {value: 'RECALL', name: 'Recall'}
};
const ModelPerformanceIndicators = {
    ADOPTION: {value: 'ADOPTION', name: 'Adoption'},
    CHURN: {value: 'CHURN', name: 'Churn'},
    CTR: {value: 'CTR', name: 'CTR'},
    CONVERSION: {value: 'CONVERSION', name: 'Conversion'}
};

const getData = (timeRange, yMaxValue, divider) => {
    let dateMili = Date.now();
    const datesArray = [];

    for (let index = 0; index < timeRange; index += 1) {
        datesArray.push(dateMili += 1000);
    }
    const data = datesArray.map((date, i) => {
        if (i % divider === 0) {
            return {x: date, y: Math.random() * yMaxValue};
        } else {
            return {x: date, y: undefined};
        }
    });

    return data;
};

const dataLatency = getData(360, 25, 5);

const MetricInfoBox = ({value, notifications, warnings, name, sampleSize, unit}) => (
    <div className='border rounded p-3 w-100'>
        <div className='d-flex flex-wrap align-items-center'>
            <span className='text-dark-bold fw-bold'>{name}</span>
            <span className='text-primary mx-1'>{`(n=${sampleSize || '-'})`}</span>
            {notifications && <FontIcon
                className='text-dark flex-grow-1'
                icon={IconNames.ALERTS_BELL}
                size={16}
            />}
            {warnings && <div className='d-flex align-items-center'>
                <FontIcon
                    className='text-warning'
                    icon={IconNames.WARNING}
                    size={16}/>
                <Link className='text-warning mx-1' style={{fontSize: '12px'}} to={Paths(1).MODEL_INCIDENTS_AND_ALERTS}>
                    View Incidents
                </Link>
            </div>}
        </div>
        <span className='text-dark' style={{fontSize: '60px'}}>{value ? value.toFixed(1) : '-'}{unit}</span>
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    notifications: PropTypes.number,
    sampleSize: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    warnings: PropTypes.number
};

const PerformanceOverview = ({errorStore, timeStore, filtersStore}) => {
    const [throughputData, setThroughputData] = useState([]);
    const [accuracy, setAccuracy] = useState(null);
    const [f1score, setF1Score] = useState(null);
    const [recall, setRecall] = useState(null);
    const [precision, setPrecision] = useState(null);
    const [sampleSize, setSampleSize] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState(ModelPerformanceMetrics.ACCURACY.value);
    const [metricData, setMetricData] = useState(getData(600, 100, 60));
    const [showIncidents, setShowIncidents] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState(ModelPerformanceIndicators.ADOPTION.value);
    const [indicatorData, setIndicatorData] = useState(getData(600, 1000, 60));

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT TIME_FLOOR(__time, '${timeStore.getTimeGranularity().toISOString()}') as "__time",
                    COUNT(*) / ${timeStore.getTimeGranularity().asSeconds()} as throughput
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                GROUP BY 1
            `
        }).then((res) => {
            setThroughputData(res.map(({throughput, __time}) => (
                {y: throughput, x: new Date(__time).getTime()}
            )));
        }).catch((e) => errorStore.reportError(e));

        timeseriesClient({
            query: `
                SELECT CAST(sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) AS DOUBLE) / sum(1) AS accuracy
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}`
        }).then(([{accuracy}]) => {
            setAccuracy(accuracy);
        }).catch((e) => errorStore.reportError(e));

        timeseriesClient({
            query: `
                WITH true_positive as (
                  SELECT
                    groundtruth as label,
                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                  FROM "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY groundtruth
                  ORDER by groundtruth
                ),
                true_sum as (
                  SELECT
                    prediction as label,
                    count(1) as cnt_ts
                  FROM "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY prediction
                  ORDER by prediction
                ),
                pred_sum as (
                  SELECT
                    groundtruth as label,
                    count(1) as cnt_ps
                  FROM "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY groundtruth
                  ORDER BY groundtruth
                )
                SELECT
                  2 * ((my_table.my_precision * my_table.my_recall) / (my_table.my_precision + my_table.my_recall)) as f1score
                FROM (
                  SELECT
                    AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as my_recall,
                    AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as my_precision
                  FROM true_positive
                  JOIN pred_sum ON pred_sum.label = true_positive.label
                  JOIN true_sum ON true_sum.label = true_positive.label
                ) as my_table
            `
        }).then(([{f1score}]) => {
            setF1Score(f1score);
        }).catch((e) => errorStore.reportError(e));

        timeseriesClient({
            query: `
                WITH true_positive as (
                  SELECT
                    groundtruth as label,
                    sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
                  FROM
                    "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY groundtruth
                  order by groundtruth
                ),
                true_sum as (
                  SELECT
                    prediction as label,
                    count(1) as cnt_ts
                  FROM
                    "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY prediction
                  order by prediction
                ),
                pred_sum as (
                  SELECT
                    groundtruth as label,
                    count(1) as cnt_ps
                  FROM
                    "dioptra-gt-combined-eventstream"
                  WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                  GROUP BY groundtruth
                  ORDER BY groundtruth
                )

                SELECT 
                  AVG(cast(true_positive.cnt_tp as double) / true_sum.cnt_ts) as recall
                FROM true_positive
                JOIN true_sum
                ON true_sum.label = true_positive.label
            `
        }).then(([{recall}]) => {
            setRecall(recall);
        }).catch((e) => errorStore.reportError(e));

        timeseriesClient({
            query: `WITH true_positive as (
              SELECT
                groundtruth as label,
                sum(CASE WHEN prediction=groundtruth THEN 1 ELSE 0 END) as cnt_tp
              FROM
                "dioptra-gt-combined-eventstream"
              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
              GROUP BY groundtruth
              ORDER BY groundtruth
            ),
            true_sum as (
              SELECT
                prediction as label,
                count(1) as cnt_ts
              FROM
                "dioptra-gt-combined-eventstream"
              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
              GROUP BY prediction
              ORDER BY prediction
            ),
            pred_sum as (
              SELECT
                groundtruth as label,
                count(1) as cnt_ps
              FROM
                "dioptra-gt-combined-eventstream"
              WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
              GROUP BY groundtruth
              ORDER BY groundtruth
            )

            SELECT 
              AVG(cast(true_positive.cnt_tp as double) / pred_sum.cnt_ps) as "precision"
            FROM true_positive
            JOIN pred_sum
            ON pred_sum.label = true_positive.label`
        }).then(([{precision}]) => {
            setPrecision(precision);
        }).catch((e) => errorStore.reportError(e));

        timeseriesClient({
            query: `
                SELECT COUNT(*) as sampleSize 
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
            `
        }).then(([{sampleSize}]) => {
            setSampleSize(sampleSize);
        }).catch((e) => errorStore.reportError(e));

    }, [timeStore.sqlTimeFilter, filtersStore.sqlFilters]);

    useEffect(() => {
        setMetricData(getData(600, 100, 60));
        setShowIncidents(false);
    }, [selectedMetric]);

    useEffect(() => {
        setIndicatorData(getData(600, 1000, 60));
    }, [selectedIndicator]);

    const handleIncidents = (e) => {

        if (e.target.checked) {
            const metricDataWarnings = [...metricData];

            metricDataWarnings[360] = {...metricDataWarnings[360], warning: metricDataWarnings[360]['y']};
            metricDataWarnings[420] = {...metricDataWarnings[420], warning: metricDataWarnings[420]['y']};
            metricDataWarnings[480] = {...metricDataWarnings[480], warning: metricDataWarnings[480]['y']};
            setMetricData(metricDataWarnings);

            setShowIncidents(true);
        } else {
            setShowIncidents(false);
        }
    };

    return (
        <>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Service Performance</h3>
                <Row>
                    {throughputData.length !== 0 && (
                        <Col lg={6}>
                            <AreaGraph
                                dots={throughputData}
                                graphType='monotone'
                                hasDot={false}
                                isTimeDependent
                                tickFormatter={(tick) => formatDateTime(moment(tick)).replace(' ', '\n')}
                                title='Average Throughput (QPS)'
                                xAxisDomain={timeStore.rangeMillisec}
                                xAxisName='Time'
                                yAxisName='Average Throughput (QPS)'
                            />
                        </Col>
                    )}
                    <Col lg={6}>
                        <AreaGraph
                            dots={dataLatency}
                            graphType='monotone'
                            hasDot={false}
                            isTimeDependent
                            tickFormatter={(tick) => formatDateTime(moment(tick)).replace(' ', '\n')}
                            title='Average Latency (ms)'
                            xAxisInterval={60}
                            xAxisName='Time'
                            yAxisDomain={[0, 25]}
                            yAxisName='Average Latency (ms)'
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Model Performance</h3>
                <Row className='mb-3 align-items-stretch'>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox
                            name='Accuracy'
                            sampleSize={sampleSize}
                            unit='%'
                            value={100 * accuracy}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox
                            name='F1 Score'
                            sampleSize={sampleSize}
                            unit='%'
                            value={100 * f1score}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox
                            name='Recall'
                            sampleSize={sampleSize}
                            unit='%'
                            value={100 * recall}
                        />
                    </Col>
                    <Col className='d-flex' lg={3}>
                        <MetricInfoBox
                            name='Precision'
                            sampleSize={sampleSize}
                            unit='%'
                            value={100 * precision}
                        />
                    </Col>
                </Row>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <label className='checkbox mx-5'>
                            <input checked={showIncidents} onChange={handleIncidents} type='checkbox'/>
                            <span>Show past incidents</span>
                        </label>
                        <div style={{width: '200px'}}>
                            <Select
                                initialValue={selectedMetric}
                                onChange={setSelectedMetric}
                                options={Object.values(ModelPerformanceMetrics)}
                            />
                        </div>
                    </div>
                    <AreaGraph
                        dots={metricData}
                        graphType='linear'
                        hasBorder={false}
                        hasWarnings={showIncidents}
                        isTimeDependent
                        margin = {
                            {right: 0, bottom: 30}
                        }
                        tickFormatter={(tick) => formatDateTime(moment(tick))}
                        unit='%'
                        xAxisInterval={60}
                        xAxisName='Time'
                        yAxisDomain={[0, 100]}
                        yAxisName={`${selectedMetric} in percent`}
                    />
                </div>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Key Performance Indicators</h3>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <div style={{width: '200px'}}>
                            <Select
                                initialValue={selectedIndicator}
                                onChange={setSelectedIndicator}
                                options={Object.values(ModelPerformanceIndicators)}
                            />
                        </div>
                    </div>
                    <Row className='m-0'>
                        <Col
                            className='border rounded d-flex flex-column align-items-center justify-content-center my-3 p-3'
                            lg={4}
                            style={{height: '295px'}}
                        >
                            <p className='text-dark fw-bold'>Correlation to KPIs</p>
                            <span className='text-dark fw-bold fs-1'>37.6</span>
                        </Col>
                        <Col className='p-0 d-flex' lg={8}>
                            <AreaGraph
                                dots={indicatorData}
                                graphType='linear'
                                hasBorder={false}
                                isTimeDependent
                                margin = {{right: 0, bottom: 30, left: 5}}
                                tickFormatter={(tick) => formatDateTime(moment(tick))}
                                xAxisInterval={60}
                                xAxisName='Time'
                                yAxisDomain={[0, 1000]}
                                yAxisName={selectedIndicator}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

PerformanceOverview.propTypes = {
    errorStore: PropTypes.object.isRequired,
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(PerformanceOverview);
