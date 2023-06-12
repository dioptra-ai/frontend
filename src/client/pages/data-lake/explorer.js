import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import {JsonParam, useQueryParam, withDefault} from 'use-query-params';

import baseJSONClient from 'clients/base-json-client';
import theme from 'styles/theme.module.scss';
import DatapointsViewer from 'components/datapoints-viewer';
import Select from 'components/select';
import ScatterChart from 'components/scatter-chart';
import DatasetSelector from 'pages/dataset/dataset-selector';
import LoadingForm from 'components/loading-form';
import Async from 'components/async';
import {getHexColor} from 'helpers/color-helper';
import WhiteScreen from 'components/white-screen';
import LoadingLink from 'components/loading-link';

const ENV_NAME = window['DIOPTRA_ENV']['name'];

const JsonParamDefaultEmptyArray = withDefault(JsonParam, []);

const Explorer = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const history = useHistory();
    const [grouping, setGrouping] = useState('');
    const [colorPerDatapointId, setColorPerDatapointId] = useState();
    const [, setFilters] = useQueryParam('filters', JsonParamDefaultEmptyArray);
    const [vectorsWithCoordinates, setVectorsWithCoordinates] = useState();
    const [dimensionReductionIsOutOfDate, setDimensionReductionIsOutOfDate] = useState(false);
    const filtersForAllModels = filters.concat(modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    } : []);

    useEffect(() => {
        setDimensionReductionIsOutOfDate(true);
    }, [JSON.stringify(filters), datasetId]);

    useEffect(() => {
        (async () => {
            if (grouping) {
                const distributions = await Promise.all((modelNames.length ? modelNames : [undefined]).map((modelName) => baseJSONClient.post(`/api/analytics/distribution/${grouping}`, {
                    filters, datasetId, modelName
                }, {memoized: true})));
                const datapointColors = distributions.reduce((acc, {histogram}) => {
                    Object.entries(histogram).forEach(([groupName, group], _, allGroups) => {
                        group.datapoints.forEach((datapointId) => {
                            if (group.index === undefined) {
                                acc[datapointId] = getHexColor(groupName);
                            } else {
                                acc[datapointId] = `hsla(${100 - group.index / allGroups.length * 100}, 100%, 50%, 1)`;
                            }
                        });
                    });

                    return acc;
                }, {});

                setColorPerDatapointId(datapointColors);
            } else {
                setColorPerDatapointId();
            }
        })();
    }, [grouping, JSON.stringify(filters), datasetId]);

    return (
        <>
            {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for analytics</div>}
            <div>
                {
                    datasetId ? (
                        <>
                            <LoadingForm className='my-2' onSubmit={async (_, {selectedEmbeddingsName, selectedAlgorithmName}) => {
                                const vectorsWithCoords = await baseJSONClient.post('/api/analytics/vectors/reduce-dimensions', {
                                    datapoint_filters: filtersForAllModels,
                                    dataset_id: datasetId,
                                    embeddings_name: selectedEmbeddingsName,
                                    algorithm_name: selectedAlgorithmName
                                }, {memoized: true});

                                setVectorsWithCoordinates(vectorsWithCoords);
                                setDimensionReductionIsOutOfDate(false);
                            }}>
                                <Async
                                    fetchData={() => baseJSONClient.post('/api/predictions/select-distinct-embedding-names', {
                                        datapointFilters: filters,
                                        datasetId
                                    }, {memoized: true})}
                                    refetchOnChanged={[filters, datasetId]}
                                    renderData={(embeddingNames) => (
                                        <Row className='g-2'>
                                            <Col>
                                                <Select required name='selectedEmbeddingsName' defaultValue=''>
                                                    {
                                                        !embeddingNames.length && (
                                                            <option value='' disabled>No embeddings available</option>
                                                        ) || null
                                                    }
                                                    {embeddingNames.map((embeddingName) => (
                                                        <option key={embeddingName} value={embeddingName}>{embeddingName}</option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col>
                                                <Select required name='selectedAlgorithmName'>
                                                    {['UMAP', 'TSNE'].map((algorithmName) => (
                                                        <option key={algorithmName} value={algorithmName}>{algorithmName}</option>
                                                    ))}
                                                </Select>
                                            </Col>
                                            <Col>
                                                <LoadingForm.Button disabled={!embeddingNames.length} variant='secondary' type='submit' className='w-100'>Run embeddings analysis</LoadingForm.Button>
                                            </Col>
                                        </Row>
                                    )}
                                />
                            </LoadingForm>
                            {vectorsWithCoordinates ? (
                                <div className='mb-2 position-relative'>
                                    <div className='position-absolute m-3' style={{top: 0, left: 0, zIndex: 1}}>
                                        <Async
                                            fetchData={() => baseJSONClient.post('/api/tags/select-distinct-names', {
                                                datapointFilters: filtersForAllModels,
                                                datasetId
                                            }, {memoized: true})}
                                            refetchOnChanged={[filtersForAllModels, datasetId]}
                                            renderData={(allTagNames) => (
                                                <Select className='fs-5' value={grouping} onChange={setGrouping}>
                                                    <option value=''>Color by...</option>
                                                    <option value='groundtruths'>Groundtruths</option>
                                                    {
                                                        modelNames.length ? (
                                                            <>
                                                                <option value='predictions'>Predictions</option>
                                                                <option value='entropy'>Entropy</option>
                                                                {/* <option value='mislabeling'>Mislabeling Score</option> */}
                                                            </>
                                                        ) : null
                                                    }
                                                    {allTagNames.map((tagName) => (
                                                        <option key={`tag/${tagName}`} value={`tag/${tagName}`}>
                                                            tags.name = {tagName}
                                                        </option>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <ScatterChart
                                        height={600}
                                        data={vectorsWithCoordinates}
                                        onSelectedDataChange={(vectors, e) => {
                                            if (e?.shiftKey) {
                                                const selectedIds = new Set(selectedDatapointIds);

                                                if (vectors.length === 1 && selectedIds.has(vectors[0]['datapoint'])) {
                                                    selectedIds.delete(vectors[0]['datapoint']);
                                                } else {
                                                    vectors.forEach((v) => selectedIds.add(v['datapoint']));
                                                }

                                                onSelectedDatapointIdsChange(selectedIds);
                                            } else {
                                                onSelectedDatapointIdsChange(new Set(vectors.map((v) => v['datapoint'])));
                                            }
                                        }}
                                        isDatapointSelected={(v) => selectedDatapointIds.has(v['datapoint'])}
                                        getColor={(v) => {
                                            if (colorPerDatapointId) {
                                                if (selectedDatapointIds.has(v['datapoint']) || selectedDatapointIds.size === 0) {

                                                    return colorPerDatapointId[v['datapoint']] || getHexColor('');
                                                } else {
                                                    return getHexColor('');
                                                }
                                            } else if (selectedDatapointIds.has(v['datapoint'])) {
                                                return theme.primary;
                                            } else {
                                                return getHexColor('');
                                            }
                                        }}
                                    />
                                    {dimensionReductionIsOutOfDate ? (<WhiteScreen>Re-run embeddings analysis</WhiteScreen>) : null}
                                </div>
                            ) : null}
                        </>
                    ) : null
                }
                {selectedDatapointIds.size ? (
                    <div className='my-2'>
                        In focus: {selectedDatapointIds.size.toLocaleString()} datapoints.&nbsp;
                        <a className='cursor-pointer' onClick={() => onSelectedDatapointIdsChange(new Set())}>Clear</a>
                    </div>
                ) : null}
                <DatapointsViewer
                    filters={[...filtersForAllModels, ...(selectedDatapointIds.size ? [{
                        left: 'id',
                        op: 'in',
                        right: Array.from(selectedDatapointIds)
                    }] : [])]}
                    datasetId={datasetId} modelNames={modelNames}
                    renderEmpty={({reload}) => (
                        <div className='text-secondary mt-2 text-center'>
                            <p>
                                The Data lake is empty. <a id='joyride-6' onClick={reload}>Reload</a> the Data Lake or Load Demo Data.
                            </p>
                            <p>
                                <LoadingForm onSubmit={async () => {
                                    const ingestionResult = await baseJSONClient.post('/api/ingestion/ingest',
                                        ENV_NAME === 'local-dev' ? {
                                            url: 'https://dioptra-public.s3.us-east-2.amazonaws.com/sample_dataset.json'
                                        } : {
                                            urls: ['https://dioptra-public.s3.us-east-2.amazonaws.com/sample_dataset.json']
                                        });

                                    if (ingestionResult['id']) {
                                        while (true) { // eslint-disable-line no-constant-condition
                                            const execution = await baseJSONClient.get(`/api/ingestion/executions/${ingestionResult['id']}`); // eslint-disable-line no-await-in-loop

                                            if (execution['status'] === 'SUCCEEDED') {
                                                break;
                                            } else if (execution['status'] === 'FAILED') {
                                                throw new Error('Ingestion failed');
                                            } else {
                                                await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line no-await-in-loop
                                            }
                                        }
                                    }

                                    const newDataset = await baseJSONClient.post('/api/dataset', {
                                        displayName: 'Demo Dataset'
                                    });
                                    const allDatapoints = await baseJSONClient.post('/api/datapoints/select', {
                                        selectColumns: ['id']
                                    });

                                    await baseJSONClient.post(`/api/dataset/${newDataset['uuid']}/add`, {
                                        datapointIds: allDatapoints.map((d) => d['id'])
                                    });

                                    window.location = `/data-lake?datasetId=${newDataset['uuid']}&modelNames=yolov7`;
                                }}>
                                    <LoadingForm.Button className='text-white' variant='primary' type='submit'>Load Demo Data</LoadingForm.Button>
                                </LoadingForm>
                            </p>
                        </div>
                    )}
                    renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                        <>
                            <a onClick={() => {
                                setFilters([...filters, {
                                    left: 'id',
                                    op: 'in',
                                    right: Array.from(selectedDatapoints)
                                }]);
                            }}>Add to filters</a>
                            &nbsp;|&nbsp;
                            <DatasetSelector
                                allowNew title='Add selected to dataset'
                                onChange={async (datasetId) => {
                                    await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                                    history.push(`/dataset/${datasetId}`);
                                }}
                            >
                                Add to dataset
                            </DatasetSelector>
                            {
                                datasetId ? (
                                    <>
                                        &nbsp;|&nbsp;
                                        <LoadingLink onClick={async () => {
                                            const datasetName = (await baseJSONClient.get(`/api/dataset/${datasetId}`))['display_name'];

                                            if (window.confirm(`Remove ${selectedDatapoints.size} datapoints from "${datasetName}"?`)) {
                                                await baseJSONClient.post(`/api/dataset/${datasetId}/remove`, {datapointIds: Array.from(selectedDatapoints)});
                                                window.location.reload();
                                            }
                                        }}>Remove from dataset</LoadingLink>
                                    </>
                                ) : null
                            }
                            &nbsp;|&nbsp;
                            <LoadingLink style={{color: theme.danger}} className='link-danger' onClick={async () => {
                                if (window.confirm(`Delete ${selectedDatapoints.size} datapoints?`)) {
                                    await baseJSONClient.post('/api/datapoints/delete', {
                                        filters: [{
                                            left: 'id',
                                            op: 'in',
                                            right: Array.from(selectedDatapoints)
                                        }]
                                    });
                                    window.location.reload();
                                }
                            }}>Delete from lake</LoadingLink>
                        </>
                    ) : null}
                />
            </div>
        </>
    );
};

Explorer.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasetId: PropTypes.string,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedDatapointIds: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointIdsChange: PropTypes.func.isRequired
};

export default Explorer;
