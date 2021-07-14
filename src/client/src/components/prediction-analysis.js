import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BarGraph from './bar-graph';
import AreaGraph from './area-graph';
import theme from '../styles/theme.module.scss';

const PredictionAnalysis = () => {
    return (
        <div className='my-5'>
            <h3 className='text-dark fw-bold fs-3 mb-3'>Prediction analysis</h3>
            <Row>
                <Col lg={4} >
                    <BarGraph bars={[
                        {name: 'Fraudulent transaction', value: '65', fill: theme.primary},
                        {name: 'Non fraudulent', value: '73', fill: '#F8C86C'},
                        {name: 'Requires human review', value: '40', fill: theme.success}
                    ]} title='Online class distribution'
                    yAxisName='Count'
                    />
                </Col>
                <Col lg={4}>
                    <BarGraph bars={[
                        {name: 'Fraudulent transaction', value: '46', fill: theme.primary},
                        {name: 'Non fraudulent', value: '60', fill: '#F8C86C'},
                        {name: 'Requires human review', value: '75', fill: theme.success}
                    ]} title='Offline class distribution'
                    yAxisName='Count'
                    />
                </Col>
                <Col lg={4}>
                    <AreaGraph
                        dots={[
                            {x: '17:28', y: 0.45},
                            {x: '17:29', y: 0.6},
                            {x: '17:30', y: 0.82},
                            {x: '17:31', y: 0.57},
                            {x: '17:32', y: 0.38},
                            {x: '17:33', y: 0.3},
                            {x: '17:34', y: 0.58}
                        ]}
                        title='KS Test'
                        xAxisName='Time'
                        yAxisDomain={[0, 1]}
                        yAxisName='KS Test Value'
                    />
                </Col>
            </Row>
        </div>
    );
};

export default PredictionAnalysis;
