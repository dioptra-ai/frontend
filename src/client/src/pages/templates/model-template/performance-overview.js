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
import {useState} from 'react';

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
const dataAdoption = getData(600, 1000, 60);
const dataAccuracy = getData(600, 100, 60);

dataAccuracy[360] = {...dataAccuracy[360], warning: dataAccuracy[360]['y']};
dataAccuracy[420] = {...dataAccuracy[420], warning: dataAccuracy[420]['y']};
dataAccuracy[480] = {...dataAccuracy[480], warning: dataAccuracy[480]['y']};

const MetricInfoBox = ({value, notifications, warnings, name, mark, unit}) => (
    <div className='border rounded p-3'>
        <div>
            <span className='text-dark'>{name}</span>
            <span className='text-primary mx-1'>{`(n=${mark})`}</span>
            {notifications !== 0 && <FontIcon
                className='text-dark'
                icon={IconNames.ALERTS_BELL}
                size={16}
            />}
        </div>
        <div style={{minHeight: '20px'}}>
            {warnings !== 0 && <>
                <FontIcon
                    className='text-warning'
                    icon={IconNames.WARNING}
                    size={16}/>
                <span className='text-warning mx-1'>View Incidents</span></>
            }
        </div>

        <span className='text-dark fw-bold fs-1'>{value}{unit}</span>
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
    {name: 'Accuracy', mark: '21,638', value: 30, unit: '%', notifications: 1, warnings: 5},
    {name: 'F1 Score', mark: '21,638', value: 35.0, unit: undefined, notifications: 0, warnings: 0},
    {name: 'Recall', mark: '21,638', value: 31.6, unit: undefined, notifications: 0, warnings: 0},
    {name: 'Precision', mark: '21,638', value: 37.8, unit: undefined, notifications: 1, warnings: 0}
];
const PerformanceOverview = () => {
    const [showIncidents, setShowIncidents] = useState(false);

    const handleIncidents = (e) => {
        if (e.target.checked) {
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
                <Row className='mb-3'>
                    {modelMetrics.map((prop, i) => (
                        <Col key={i} lg={12 / modelMetrics.length}>
                            <MetricInfoBox
                                mark={prop.mark}
                                name={prop.name}
                                notifications={prop.notifications}
                                unit={prop.unit}
                                value={prop.value}
                                warnings={prop.notifications}
                            />
                        </Col>
                    ))}
                </Row>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <label className='checkbox mx-5'>
                            <input onChange={handleIncidents} type='checkbox'/>
                            <span>Show past incidents</span>
                        </label>
                        <DropdownMenu label='Accuracy'
                            options={[
                                'Accuracy',
                                'F1 Score',
                                'Precision',
                                'Recall'
                            ]}
                        />
                    </div>
                    <AreaGraph
                        dots={dataAccuracy}
                        graphType='linear'
                        hasBorder={false}
                        hasWarnings={showIncidents}
                        margin = {
                            {right: 0, bottom: 30}
                        }
                        tickFormatter={(tick) => formatTime(moment(tick))}
                        xAxisInterval={60}
                        xAxisName='Time'
                        yAxisDomain={[0, 100]}
                        yAxisName='Accuracy in percent'
                    />
                </div>
            </div>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Key Performance Indicators</h3>
                <div className='border rounded p-3'>
                    <div className='d-flex justify-content-end my-3'>
                        <DropdownMenu label='Adoption'
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
                                dots={dataAdoption}
                                graphType='linear'
                                hasBorder={false}
                                margin = {
                                    {right: 0, bottom: 30, left: 5}
                                }
                                tickFormatter={(tick) => formatTime(moment(tick))}
                                xAxisInterval={60}
                                xAxisName='Time'
                                yAxisDomain={[0, 1000]}
                                yAxisName='Adoption'
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default PerformanceOverview;
