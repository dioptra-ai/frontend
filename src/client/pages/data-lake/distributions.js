import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import {Bar} from 'recharts';

import theme from 'styles/theme.module.scss';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';
import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import Error from 'components/error';
import LoadingForm from 'components/loading-form';
import Select from 'components/select';
import WhiteScreen from 'components/white-screen';

const DataLakeDistributions = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const [groupedDatapoints, setGroupedDatapoints] = useState();
    const [groupAnalysisIsOutOfDate, setGroupAnalysisIsOutOfDate] = useState(false);
    const allFilters = filters.concat(selectedDatapointIds.size ? {
        left: 'datapoints.id',
        op: 'in',
        right: Array.from(selectedDatapointIds)
    } : [], modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    } : []);

    useEffect(() => {
        setGroupAnalysisIsOutOfDate(true);
    }, [filters, datasetId, modelNames]);

    return (
        <>
            <div className='my-2'>
                <LoadingForm className='my-2' onSubmit={async (_, {selectedGroupBy}) => {
                    // TODO: This to return datapoints grouped by mislabeling score
                    const results = await Promise.all(modelNames.map((m) => baseJSONClient.post(`/api/metrics/distribution/${selectedGroupBy}`, {
                        datapoint_filters: filters,
                        dataset_id: datasetId,
                        model_name: m
                    })));

                    setGroupedDatapoints(results);
                    setGroupAnalysisIsOutOfDate(false);
                }}>
                    <Row className='g-2'>
                        <Col>
                            <Select required name='selectedGroupBy'>
                                <option value='mislabeling'>Group by Mislabeling Score</option>
                            </Select>
                        </Col>
                        <Col>
                            <LoadingForm.Button variant='secondary' type='submit' className='w-100'>Run group analysis</LoadingForm.Button>
                        </Col>
                    </Row>
                </LoadingForm>
            </div>
            <div className='my-2'>
                {groupedDatapoints ? (
                    <div className='position-relative'>
                        <BarGraph title='Groups'
                            bars={groupedDatapoints.reduce((acc, {group, id}) => {
                                const existing = acc.find((i) => i.name === group);

                                if (existing) {
                                    existing.value += 1;
                                    existing.datapoints.push(id);
                                } else {
                                    acc.push({
                                        name: group,
                                        value: 1,
                                        datapoints: [id]
                                    });
                                }

                                return acc;
                            }, [])}
                            sortBy='value'
                            onClick={({datapoints}) => {
                                onSelectedDatapointIdsChange(new Set(datapoints));
                            }}
                        />
                        {groupAnalysisIsOutOfDate ? (<WhiteScreen>Re-run group analysis</WhiteScreen>) : null}
                    </div>
                ) : null}
            </div>
            <Row className='g-2 mt-4'>
                <Async
                    fetchData={async () => {
                        const datapoints = await baseJSONClient.post('/api/datapoints/select', {
                            filters: allFilters,
                            datasetId,
                            selectColumns: ['id']
                        }, {memoized: true});

                        // TODO: this to return "datapoints" an array of datapoint ids
                        return baseJSONClient.post('/api/metrics/distribution/groundtruths', {
                            filters: [{
                                left: 'datapoint',
                                op: 'in',
                                right: datapoints.map((datapoint) => datapoint.id)
                            }]
                        }, {memoized: true});
                    }}
                    refetchOnChanged={[JSON.stringify(allFilters), datasetId]}
                    renderData={(groundtruthDistribution) => groundtruthDistribution.histogram && Object.keys(groundtruthDistribution.histogram).length ? (
                        <Col md={modelNames?.length ? 6 : 12}>
                            <BarGraph
                                onClick={({datapoints}) => {
                                    onSelectedDatapointIdsChange(new Set(datapoints));
                                }}
                                title={groundtruthDistribution.title || 'Groundtruths'}
                                verticalIfMoreThan={10}
                                bars={Object.entries(groundtruthDistribution.histogram).map(([name, {value, datapoints}]) => ({
                                    name,
                                    value,
                                    datapoints,
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
                                    filters: allFilters,
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
                            refetchOnChanged={[JSON.stringify(allFilters), datasetId, modelNames]}
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
                                                    const datapoints = distribution.histogram[className]?.['datapoints'] || [];

                                                    return {
                                                        ...acc,
                                                        [modelNames[i]]: distribution.histogram[className]?.['value'],
                                                        datapoints: datapoints.concat(acc.datapoints || [])
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
                                                    onClick={({datapoints}) => {
                                                        onSelectedDatapointIdsChange(new Set(datapoints));
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
                                    filters: allFilters,
                                    datasetId,
                                    selectColumns: ['id']
                                }, {memoized: true});

                                return Promise.all(modelNames.map((modelName) => baseJSONClient.post('/api/metrics/distribution/entropy', {
                                    datapoint_ids: datapoints.map((datapoint) => datapoint.id),
                                    model_name: modelName
                                }, {memoized: true})));
                            }}
                            refetchOnChanged={[JSON.stringify(allFilters), datasetId, modelNames]}
                            renderData={(distributions) => {
                                const bins = Array.from(new Set(distributions.flatMap((distribution) => Object.keys(distribution.histogram))));

                                return (
                                    <BarGraph
                                        title='Entropies'
                                        verticalIfMoreThan={Infinity}
                                        bars={bins.map((bin) => ({
                                            name: bin,
                                            ...distributions.reduce((acc, distribution, i) => {
                                                const datapoints = distribution.histogram[bin]?.['datapoints'] || [];

                                                return {
                                                    ...acc,
                                                    [modelNames[i]]: distribution.histogram[bin]?.['value'],
                                                    datapoints: datapoints.concat(acc.datapoints || [])
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
                                                onClick={({datapoints}) => {
                                                    onSelectedDatapointIdsChange(new Set(datapoints));
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
    datasetId: PropTypes.string.isRequired,
    modelNames: PropTypes.array,
    selectedDatapointIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectedDatapointIdsChange: PropTypes.func.isRequired
};

export default DataLakeDistributions;
