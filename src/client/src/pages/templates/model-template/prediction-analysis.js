import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';

const PredictionAnalysis = ({timeStore}) => {

    return (
        <Row className='my-5'>
            <Col className='d-flex' lg={4}>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, Count}) => (
                                {name: getName(prediction), value: Count, fill: getHexColor(prediction)}
                            ))}
                            title='Online Class Distribution'
                            yAxisName='Count'
                        />
                    )}
                    sql={sql`
                        SELECT
                        prediction,
                        COUNT(*) AS "Count"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE ${timeStore.sqlTimeFilter} 
                        GROUP BY 1`
                    }
                />
            </Col>
            <Col className='d-flex' lg={4}>
                <TimeseriesQuery
                    defaultData={[]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({prediction, Count}) => (
                                {name: getName(prediction), value: Count, fill: getHexColor(prediction)}
                            ))}
                            title='Offline Class Distribution'
                            yAxisName='Count'
                        />
                    )}
                    sql={sql`
                        SELECT
                        prediction,
                        COUNT(*) AS "Count"
                        FROM "dioptra-gt-combined-eventstream"
                        WHERE "__time" >= TIME_PARSE('2021-07-23T00:00:00.000Z') AND "__time" < TIME_PARSE('2021-07-24T00:00:00.000Z')
                        GROUP BY 1`
                    }
                />
            </Col>
            <Col className='d-flex' lg={4}>
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
    timeStore: PropTypes.object
};
export default setupComponent(PredictionAnalysis);
