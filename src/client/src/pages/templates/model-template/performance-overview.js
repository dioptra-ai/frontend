import PropTypes from 'prop-types';
import FilterInput from '../../../components/filter-input';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AreaGraph from '../../../components/area-graph';
import {formatTime} from '../../../helpers/date-helper';
import moment from 'moment';
import DropdownMenu from '../../../components/dropdown';
import FontIcon from '../../../components/font-icon';
import {IconNames} from '../../../constants';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {Paths} from '../../../configs/route-config';
import {setupComponent} from '../../../helpers/component-helper';

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

const dataThroughput = getData(360, 50, 5);
const dataLatency = getData(360, 25, 5);

const MetricInfoBox = ({value, notifications, warnings, name, mark, unit}) => (
    <div className='border rounded p-3'>
        <div className='d-flex flex-wrap align-items-center'>
            <span className='text-dark-bold fw-bold'>{name}</span>
            <span className='text-primary mx-1'>{`(n=${mark})`}</span>
            {notifications !== 0 && <FontIcon
                className='text-dark flex-grow-1'
                icon={IconNames.ALERTS_BELL}
                size={16}
            />}
            {warnings !== 0 && <div className='d-flex align-items-center'>
                <FontIcon
                    className='text-warning'
                    icon={IconNames.WARNING}
                    size={16}/>
                <Link className='text-warning mx-1' style={{fontSize: '12px'}} to={Paths(1).MODEL_INCIDENTS_AND_ALERTS}>
                    View Incidents
                </Link>
            </div>}
        </div>
        <span className='text-dark' style={{fontSize: '60px'}}>{value}{unit}</span>
    </div>
);

MetricInfoBox.propTypes = {
    mark: PropTypes.any,
    name: PropTypes.string,
    notifications: PropTypes.number,
    unit: PropTypes.string,
    value: PropTypes.number,
    warnings: PropTypes.number
};

const modelMetrics = [
    {name: 'Accuracy', mark: '21,638', value: 30, unit: '%', notifications: 1, warnings: 3},
    {name: 'F1 Score', mark: '21,638', value: 35.0, unit: undefined, notifications: 0, warnings: 0},
    {name: 'Recall', mark: '21,638', value: 31.6, unit: undefined, notifications: 0, warnings: 0},
    {name: 'Precision', mark: '21,638', value: 37.8, unit: undefined, notifications: 0, warnings: 0}
];
const PerformanceOverview = () => {
    const [selectedMetric, setSelectedMetric] = useState('Accuracy');
    const [metricData, setMetricData] = useState(getData(600, 100, 60));
    const [showIncidents, setShowIncidents] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState('Adoption');
    const [indicatorData, setIndicatorData] = useState(getData(600, 1000, 60));

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
            <FilterInput/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Service Performance</h3>
                <Row>
                    <Col lg={6}>
                        <AreaGraph
                            dots={dataThroughput}
                            graphType='monotone'
                            hasDot={false}
                            isTimeDependent
                            tickFormatter={(tick) => formatTime(moment(tick))}
                            title='Throughput (QPS)'
                            xAxisInterval={60}
                            xAxisName='Time'
                            yAxisDomain={[0, 50]}
                            yAxisName='Daily average QPS'
                        />
                    </Col>
                    <Col lg={6}>
                        <AreaGraph
                            dots={dataLatency}
                            graphType='monotone'
                            hasDot={false}
                            isTimeDependent
                            tickFormatter={(tick) => formatTime(moment(tick))}
                            title='Latency (ms)'
                            xAxisInterval={60}
                            xAxisName='Time'
                            yAxisDomain={[0, 25]}
                            yAxisName='Daily average latency (ms)'
                        />
                    </Col>
                </Row>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Model Performance</h3>
                <Row className='mb-3 align-items-stretch'>
                    {modelMetrics.map((prop, i) => (
                        <Col key={i} lg={12 / modelMetrics.length}>
                            <MetricInfoBox
                                mark={prop.mark}
                                name={prop.name}
                                notifications={prop.notifications}
                                unit={prop.unit}
                                value={prop.value}
                                warnings={prop.warnings}
                            />
                        </Col>
                    ))}
                </Row>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <label className='checkbox mx-5'>
                            <input checked={showIncidents} onChange={handleIncidents} type='checkbox'/>
                            <span>Show past incidents</span>
                        </label>
                        <DropdownMenu
                            label={selectedMetric}
                            onClick={(e) => setSelectedMetric(e.target.name)}
                            options={[
                                'Accuracy',
                                'F1 Score',
                                'Precision',
                                'Recall'
                            ]}
                        />
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
                        tickFormatter={(tick) => formatTime(moment(tick))}
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
                        <DropdownMenu
                            label={selectedIndicator}
                            onClick={(e) => setSelectedIndicator(e.target.name)}
                            options={[
                                'Churn',
                                'Adoption',
                                'CTR',
                                'Conversion'
                            ]}
                        />
                    </div>
                    <Row className='m-0'>
                        <Col
                            className='border rounded d-flex flex-column align-items-center justify-content-center my-3 p-3'
                            lg={4}
                        >
                            <p className='text-dark fw-bold'>Correlation to KPIs</p>
                            <span className='text-dark fw-bold fs-1'>37.6</span>
                        </Col>
                        <Col className='p-0' lg={8}>
                            <AreaGraph
                                dots={indicatorData}
                                graphType='linear'
                                hasBorder={false}
                                isTimeDependent
                                margin = {
                                    {right: 0, bottom: 30, left: 5}
                                }
                                tickFormatter={(tick) => formatTime(moment(tick))}
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

export default setupComponent(PerformanceOverview);
