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
import BarGraph from 'components/bar-graph';
import WhiteScreen from 'components/white_screen';

const Explorer = ({filters, setFilters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const history = useHistory();
    const [vectorsWithCoordinates, setVectorsWithCoordinates] = useState();
    const [dimensionReductionIsOutOfDate, setDimensionReductionIsOutOfDate] = useState(false);
    const [groupedPredictions, setGroupedPredictions] = useState();
    const [groupAnalysisIsOutOfDate, setGroupAnalysisIsOutOfDate] = useState(false);
    const filtersForSelectedDatapointsAndModels = filters.concat();

    if (selectedDatapointIds.size) {
        filtersForSelectedDatapointsAndModels.push({
            left: 'datapoints.id',
            op: 'in',
            right: Array.from(selectedDatapointIds)
        });
    }

    if (modelNames.length) {
        filtersForSelectedDatapointsAndModels.push({
            left: 'predictions.model_name',
            op: 'in',
            right: modelNames
        });
    }

    useEffect(() => {
        setDimensionReductionIsOutOfDate(true);
        setGroupAnalysisIsOutOfDate(true);
    }, [filters, datasetId, modelNames]);

    return (
        <>
            {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for analytics</div>}
            <div>
                {
                    datasetId ? (
                        <>
                            <LoadingForm className='my-2' onSubmit={async (_, {selectedEmbeddingsName, selectedAlgorithmName}) => {
                                const vectorsWithCoords = await baseJSONClient.post('/api/metrics/predictions/vectors/reduce-dimensions', {
                                    datapoint_filters: filters,
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
                                                <Select required name='selectedAlgorithmName' defaultValue='umap'>
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
                            <LoadingForm className='my-2' onSubmit={async (_, {selectedGroupBy}) => {
                                const results = await Promise.all(modelNames.map((m) => baseJSONClient.post('/api/metrics/predictions/group', {
                                    datapoint_filters: filters,
                                    dataset_id: datasetId,
                                    model_name: m,
                                    group_by: selectedGroupBy
                                })));

                                setGroupedPredictions(results.flat());
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
                                {groupedPredictions ? (
                                    <div className='position-relative'>
                                        <BarGraph title='Groups'
                                            bars={groupedPredictions.reduce((acc, {group, id}) => {
                                                const existing = acc.find((i) => i.name === group);

                                                if (existing) {
                                                    existing.value += 1;
                                                    existing.predictionIds.push(id);
                                                } else {
                                                    acc.push({
                                                        name: group,
                                                        value: 1,
                                                        predictionIds: [id]
                                                    });
                                                }

                                                return acc;
                                            }, [])}
                                            sortBy='value'
                                            onClick={({predictionIds}) => {
                                                setFilters([...filters, {
                                                    left: 'predictions.id',
                                                    op: 'in',
                                                    right: predictionIds
                                                }]);
                                            }}
                                        />
                                        {groupAnalysisIsOutOfDate ? (<WhiteScreen>Re-run group analysis</WhiteScreen>) : null}
                                    </div>
                                ) : null}
                            </div>
                        </>
                    ) : null
                }
                <DatapointsViewer
                    filters={filtersForSelectedDatapointsAndModels} datasetId={datasetId} modelNames={modelNames}
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
    setFilters: PropTypes.func.isRequired,
    datasetId: PropTypes.string,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedDatapointIds: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointIdsChange: PropTypes.func.isRequired
};

export default Explorer;
