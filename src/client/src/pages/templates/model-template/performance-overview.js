import FilterInput from '../../../components/filter-input';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LineGraph from '../../../components/line-graph';
import {formatTime} from '../../../helpers/date-helper';
import moment from 'moment';

const getData = (maxValue) => {
    let dateMili = Date.now();
    const datesArray = [];

    for (let index = 0; index < 100; index += 1) {
        datesArray.push(dateMili += 1000);
    }
    const data = datesArray.map((date) => ({
        x: date,
        y: Math.random() * maxValue
    }));


    return data;
};

const PerformanceOverview = () => {
    const dataThroughput = getData(50);
    const dataLatency = getData(25);

    return (
        <>
            <FilterInput/>
            <Row>
                <Col lg={6}>
                    <LineGraph
                        dots={dataThroughput}
                        graphType='monotone'
                        hasDot={false}
                        tickFormatter={(tick) => formatTime(moment(tick))}
                        title='Throughput (QPS)'
                        xAxisInterval={15}
                        xAxisName='Time'
                        yAxisDomain={[0, 50]}
                        yAxisName='Daily average QPS'
                    />
                </Col>
                <Col lg={6}>
                    <LineGraph
                        dots={dataLatency}
                        hasDot={false}
                        tickFormatter={(tick) => formatTime(moment(tick))}
                        title='Latency (ms)'
                        xAxisInterval={15}
                        xAxisName='Time'
                        yAxisDomain={[0, 25]}
                        yAxisName='Daily average latency (ms)'
                    />
                </Col>
            </Row>
        </>
    );
};

export default PerformanceOverview;
