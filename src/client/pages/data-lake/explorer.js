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

const JsonParamDefaultEmptyArray = withDefault(JsonParam, []);

const Explorer = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const history = useHistory();
    const [, setFilters] = useQueryParam('filters', JsonParamDefaultEmptyArray);
    const [vectorsWithCoordinates, setVectorsWithCoordinates] = useState();
    const [dimensionReductionIsOutOfDate, setDimensionReductionIsOutOfDate] = useState(false);
    const filtersWithModels = filters.concat(modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    } : []);

    useEffect(() => {
        setDimensionReductionIsOutOfDate(true);
    }, [JSON.stringify(filtersWithModels), datasetId]);

    return (
        <>
            {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for analytics</div>}
            <div>
                {
                    datasetId ? (
                        <>
                            <LoadingForm className='my-2' onSubmit={async (_, {selectedEmbeddingsName, selectedAlgorithmName}) => {
                                const vectorsWithCoords = await baseJSONClient.post('/api/metrics/vectors/reduce-dimensions', {
                                    datapoint_filters: filtersWithModels,
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
                                        datasetId,
                                        modelNames
                                    }, {memoized: true})}
                                    refetchOnChanged={[filters, datasetId, modelNames]}
                                    renderData={(embeddingNames) => (
                                        <Row className='g-2'>
                                            <Col>
                                                <Select required name='selectedEmbeddingsName' defaultValue=''>
                                                    <option value='' disabled>{
                                                        embeddingNames.length ? 'Select an embedding' : 'No embeddings available'
                                                    }</option>
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
                                    <ScatterChart
                                        height={400}
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
                                            if (selectedDatapointIds.has(v['datapoint'])) {
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
                    filters={[...filtersWithModels, ...(selectedDatapointIds.size ? [{
                        left: 'id',
                        op: 'in',
                        right: Array.from(selectedDatapointIds)
                    }] : [])]}
                    datasetId={datasetId} modelNames={modelNames}
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
