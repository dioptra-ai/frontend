import React, {useEffect, useState} from 'react';
import {setupComponent} from '../../../helpers/component-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import BarGraph from './../../../components/bar-graph';
import AreaGraph from './../../../components/area-graph';
import theme from './../../../styles/theme.module.scss';
import PropTypes from 'prop-types';
import timeseriesClient from 'clients/timeseries';
import {getRandomHexColor} from 'helpers/color-helper';
import {getName} from '../../../helpers/name-helper';

const PredictionAnalysis = ({errorStore, timeStore}) => {
    const [onlineDistribution, setOnlineDistribution] = useState([]);

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT
                prediction,
                COUNT(*) AS "Count"
                FROM "dioptra-gt-combined-eventstream"
                WHERE ${timeStore.sQLTimeFilter} 
                GROUP BY 1
            `
        }).then((res) => {
            console.log(res);
            setOnlineDistribution(res);
        }).catch((e) => errorStore.reportError(e));
    }, [timeStore.sQLTimeFilter]);

    return (
        <Row className='my-5'>
            <Col lg={4} >
                <BarGraph
                    bars={onlineDistribution.map((dist) => (
                        {name: getName(dist.prediction), value: dist.Count, fill: getRandomHexColor(1)}
                    ))}
                    title='Online class distribution'
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
    );
};

PredictionAnalysis.propTypes = {
    errorStore: PropTypes.object,
    timeStore: PropTypes.object
};
export default setupComponent(PredictionAnalysis);
