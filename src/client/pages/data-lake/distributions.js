import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import {Bar} from 'recharts';

import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';

const DataLakeDistributions = ({filters, datasetId, modelNames}) => {
    const filtersWithModelNames = modelNames.length ? filters.concat([{
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    }]) : filters;

    return (
        <>
            <Row className='g-2 mt-4'>
                <Col md={modelNames?.length ? 6 : 12}>
                    <Async fetchData={async () => {
                        const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                            filters: filtersWithModelNames,
                            datasetId,
                            selectColumns: ['id']
                        }, {memoized: true});

                        return baseJSONClient.post('/api/metrics/distribution/groundtruths', {
                            filters: [{
                                left: 'datapoint',
                                op: 'in',
                                right: datapoints.map((datapoint) => datapoint.id)
                            }]
                        }, {memoized: true});
                    }}
                    refetchOnChanged={[filtersWithModelNames, datasetId]}
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
                                    filters: filtersWithModelNames,
                                    datasetId,
                                    selectColumns: ['id']
                                }, {memoized: true});

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
                                }, {memoized: true})));
                            }}
                            refetchOnChanged={[filters, datasetId, modelNames]}
                            renderData={(distributions) => {
                                const classes = Array.from(new Set(distributions.flatMap((distribution) => Object.keys(distribution.histogram))));

                                return (
                                    <BarGraph
                                        title='Predictions'
                                        verticalIfMoreThan={10}
                                        bars={classes.map((className) => ({
                                            name: className,
                                            ...distributions.reduce((acc, distribution, i) => ({
                                                ...acc,
                                                [modelNames[i]]: distribution.histogram[className]
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
            {
                modelNames?.length ? (
                    <div className='mt-2'>
                        <Async fetchData={async () => {
                            const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                                filters: filtersWithModelNames,
                                datasetId,
                                selectColumns: ['id']
                            }, {memoized: true});

                            return Promise.all(modelNames.map((modelName) => baseJSONClient.post('/api/metrics/distribution/entropy', {
                                datapoint_ids: datapoints.map((datapoint) => datapoint.id),
                                model_name: modelName
                            }, {memoized: true})));
                        }}
                        refetchOnChanged={[filters, datasetId, modelNames]}
                        renderData={(distributions) => {
                            const bins = Array.from(new Set(distributions.flatMap((distribution) => Object.keys(distribution.histogram))));

                            return (
                                <BarGraph
                                    title='Entropies'
                                    bars={bins.map((bin) => ({
                                        name: bin,
                                        ...distributions.reduce((acc, distribution, i) => ({
                                            ...acc,
                                            [modelNames[i]]: distribution.histogram[bin]
                                        }), {})
                                    }))}
                                >
                                    {modelNames.map((modelName) => (
                                        <Bar key={modelName} maxBarSize={50} minPointSize={2} dataKey={modelName} fill={getHexColor(modelName)} />
                                    ))}
                                </BarGraph>
                            );
                        }} />
                    </div>
                ) : null
            }
        </>
    );
};

DataLakeDistributions.propTypes = {
    filters: PropTypes.array,
    datasetId: PropTypes.string.isRequired,
    modelNames: PropTypes.array
};

export default DataLakeDistributions;
