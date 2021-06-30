import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BarGraph from './bar-graph';
import LineGraph from './line-graph';

const PredictionAnalysis = () => {
    return (
        <Container className='px-2 my-5' fluid>
            <p className='text-dark fw-bold fs-3'>Prediction analysis</p>
            <Row>
                <Col lg={4} >
                    <BarGraph bars={[
                        {name: 'Fraudulent transaction', value: '65', fill: '#1FA9C8'},
                        {name: 'Non fraudulent', value: '73', fill: '#F8C86C'},
                        {name: 'Requires human review', value: '40', fill: '#62BD6C'}
                    ]} title='Online class distribution'
                    yAxisName='Count'
                    />
                </Col>
                <Col lg={4}>
                    <BarGraph bars={[
                        {name: 'Fraudulent transaction', value: '46', fill: '#1FA9C8'},
                        {name: 'Non fraudulent', value: '60', fill: '#F8C86C'},
                        {name: 'Requires human review', value: '75', fill: '#62BD6C'}
                    ]} title='Offline class distribution'
                    yAxisName='Count'
                    />
                </Col>
                <Col lg={4}>
                    <LineGraph dots={[
                        {x: '17:28', y: 0.45},
                        {x: '17:29', y: 0.6},
                        {x: '17:30', y: 0.82},
                        {x: '17:31', y: 0.57},
                        {x: '17:32', y: 0.38},
                        {x: '17:33', y: 0.3},
                        {x: '17:34', y: 0.58}
                    ]} title='KS Test'
                    xAxisName='Time'
                    yAxisName='KS Test Value'
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default PredictionAnalysis;
