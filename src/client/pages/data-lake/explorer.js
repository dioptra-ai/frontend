import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';

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

const Explorer = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const history = useHistory();
    const [vectorsWithCoordinates, setVectorsWithCoordinates] = useState();
    const [dimensionReductionIsOutOfDate, setDimensionReductionIsOutOfDate] = useState(false);
    const allFilters = filters.concat(modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    } : []);

    useEffect(() => {
        setDimensionReductionIsOutOfDate(true);
    }, [JSON.stringify(filters), datasetId, modelNames]);

    return (
        <>
            {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for analytics</div>}
            <div>
                {
                    datasetId ? (
                        <>
                            <LoadingForm className='my-2' onSubmit={async (_, {selectedEmbeddingsName, selectedAlgorithmName}) => {
                                const vectorsWithCoords = await baseJSONClient.post('/api/metrics/vectors/reduce-dimensions', {
                                    datapoint_filters: allFilters,
                                    dataset_id: datasetId,
                                    embeddings_name: selectedEmbeddingsName,
                                    algorithm_name: selectedAlgorithmName
                                });

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
                            <div className='mb-2'>
                                {vectorsWithCoordinates ? (
                                    <div className='position-relative'>
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
                            </div>
                        </>
                    ) : null
                }
                <DatapointsViewer
                    filters={allFilters} datasetId={datasetId} modelNames={modelNames}
                    selectedDatapoints={selectedDatapointIds}
                    onSelectedDatapointsChange={onSelectedDatapointIdsChange}
                    renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                        <>
                            <DatasetSelector
                                allowNew title='Add selected to dataset'
                                onChange={async (datasetId) => {
                                    await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                                    history.push(`/dataset/${datasetId}`);
                                }}
                            >
                                Add to dataset
                            </DatasetSelector>
                            &nbsp;|&nbsp;
                            <a style={{color: theme.danger}} className='link-danger' onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${selectedDatapoints.size} datapoints?`)) {
                                    await baseJSONClient.post('/api/datapoints/delete', {
                                        filters: [{
                                            left: 'id',
                                            op: 'in',
                                            right: Array.from(selectedDatapoints)
                                        }]
                                    });
                                    window.location.reload();
                                }
                            }}>Delete from lake</a>
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
