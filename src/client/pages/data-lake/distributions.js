import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import {Bar} from 'recharts';

import theme from 'styles/theme.module.scss';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Error from 'components/error';

const DataLakeDistributions = ({filters, setFilters, datasetId, modelNames}) => {
    const filtersWithModelNames = modelNames.length ? filters.concat([{
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    }]) : filters;

    return (
        <>
            <Row className='g-2 mt-4'>
                <Async
                    fetchData={async () => {
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
                        <Col md={modelNames?.length ? 6 : 12}>
                            <BarGraph
                                onClick={({groundtruthIds}) => {
                                    setFilters([{
                                        left: 'groundtruths.id',
                                        op: 'in',
                                        right: groundtruthIds
                                    }]);
                                }}
                                title={groundtruthDistribution.title || 'Groundtruths'}
                                verticalIfMoreThan={10}
                                bars={Object.entries(groundtruthDistribution.histogram).map(([name, {value, ids}]) => ({
                                    name,
                                    value,
                                    groundtruthIds: ids,
                                    fill: theme.primary
                                }))}
                            />
                        </Col>
                    ) : null
                    }
                    renderError={(err) => err.status === 501 ? null : <Error error={err} />}
                />
                {
                    modelNames?.length ? (
                        <Async
                            fetchData={async () => {
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
                                    <Col md={6}>
                                        <BarGraph
                                            title={distributions[0].title || 'Predictions'}
                                            verticalIfMoreThan={10}
                                            bars={classes.map((className) => ({
                                                name: className,
                                                ...distributions.reduce((acc, distribution, i) => {
                                                    const predictionIds = distribution.histogram[className]?.['ids'] || [];

                                                    return {
                                                        ...acc,
                                                        [modelNames[i]]: distribution.histogram[className]?.['value'],
                                                        predictionIds: predictionIds.concat(acc.predictionIds || [])
                                                    };
                                                }, {})
                                            }))}
                                        >
                                            {modelNames.map((modelName) => (
                                                <Bar
                                                    className='cursor-pointer'
                                                    key={modelName}
                                                    maxBarSize={50}
                                                    minPointSize={2}
                                                    dataKey={modelName}
                                                    fill={getHexColor(modelName)}
                                                    onClick={({predictionIds}) => {
                                                        setFilters([{
                                                            left: 'predictions.id',
                                                            op: 'in',
                                                            right: predictionIds
                                                        }]);
                                                    }} />
                                            ))}
                                        </BarGraph>
                                    </Col>
                                );
                            }}
                            renderError={(err) => err.status === 501 ? null : <Error error={err} />}
                        />
                    ) : null
                }
            </Row>
            {
                modelNames?.length ? (
                    <div className='mt-2'>
                        <Async
                            fetchData={async () => {
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
                                        verticalIfMoreThan={Infinity}
                                        bars={bins.map((bin) => ({
                                            name: bin,
                                            ...distributions.reduce((acc, distribution, i) => {
                                                const predictionIds = distribution.histogram[bin]?.['ids'] || [];

                                                return {
                                                    ...acc,
                                                    [modelNames[i]]: distribution.histogram[bin]?.['value'],
                                                    predictionIds: predictionIds.concat(acc.predictionIds || [])
                                                };
                                            }, {})
                                        }))}
                                    >
                                        {modelNames.map((modelName) => (
                                            <Bar
                                                className='cursor-pointer'
                                                key={modelName}
                                                maxBarSize={50} minPointSize={2}
                                                dataKey={modelName}
                                                fill={getHexColor(modelName)}
                                                onClick={({predictionIds}) => {
                                                    setFilters([{
                                                        left: 'predictions.id',
                                                        op: 'in',
                                                        right: predictionIds
                                                    }]);
                                                }}
                                            />
                                        ))}
                                    </BarGraph>
                                );
                            }}
                            renderError={(err) => err.status === 501 ? null : <Error error={err} />}
                        />
                    </div>
                ) : null
            }
        </>
    );
};

DataLakeDistributions.propTypes = {
    filters: PropTypes.array,
    setFilters: PropTypes.func.isRequired,
    datasetId: PropTypes.string.isRequired,
    modelNames: PropTypes.array
};

export default DataLakeDistributions;
