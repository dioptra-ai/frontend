import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import {Bar} from 'recharts';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const DataLakeDistributions = ({datapointFilters, datasetId, modelNames}) => (
    <Row className='g-2 mt-4'>
        <Col md={modelNames?.length ? 6 : 12}>
            <Async fetchData={async () => {
                const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                    filters: datapointFilters,
                    datasetId,
                    selectColumns: ['id']
                });

                return baseJSONClient.post('/api/metrics/distribution/groundtruths', {
                    filters: [{
                        left: 'datapoint',
                        op: 'in',
                        right: datapoints.map((datapoint) => datapoint.id)
                    }]
                });
            }}
            refetchOnChanged={[datapointFilters, datasetId]}
            renderData={(groundtruthDistribution) => groundtruthDistribution.histogram && Object.keys(groundtruthDistribution.histogram).length ? (
                <BarGraph
                    title='Groundtruths'
                    verticalIfMoreThan={10}
                    bars={Object.entries(groundtruthDistribution.histogram).map(([name, value]) => ({
                        name, value, fill: getHexColor(name)
                    }))}
                />
            ) : null
            } />
        </Col>
        {
            modelNames?.length ? (
                <Col md={6}>
                    <Async fetchData={async () => {
                        const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                            filters: datapointFilters,
                            datasetId,
                            selectColumns: ['id']
                        });

                        return Promise.all(modelNames.map((modelName) => baseJSONClient.post('/api/metrics/distribution/predictions', {
                            filters: [{
                                left: 'datapoint',
                                op: 'in',
                                right: datapoints.map((datapoint) => datapoint.id)
                            }, {
                                left: 'model_name',
                                op: '=',
                                right: modelName
                            }]
                        })));
                    }}
                    refetchOnChanged={[datapointFilters, datasetId]}
                    renderData={(predictionDistributions) => {
                        const classes = Array.from(new Set(predictionDistributions.flatMap((predictionDistribution) => Object.keys(predictionDistribution.histogram))));

                        return (
                            <BarGraph
                                title='Predictions'
                                verticalIfMoreThan={10}
                                bars={classes.map((className) => ({
                                    name: className,
                                    ...predictionDistributions.reduce((acc, predictionDistribution, i) => ({
                                        ...acc,
                                        [modelNames[i]]: predictionDistribution.histogram[className]
                                    }), {})
                                }))}
                            >
                                {modelNames.map((modelName) => (
                                    <Bar key={modelName} maxBarSize={50} minPointSize={2} dataKey={modelName} fill={getHexColor(modelName)} />
                                ))}
                            </BarGraph>
                        );
                    }} />
                </Col>
            ) : null
        }
    </Row>
);

DataLakeDistributions.propTypes = {
    datapointFilters: PropTypes.array,
    datasetId: PropTypes.string.isRequired,
    modelNames: PropTypes.array
};

export default DataLakeDistributions;
