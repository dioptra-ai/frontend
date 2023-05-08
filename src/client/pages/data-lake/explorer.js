import PropTypes from 'prop-types';
import {useState} from 'react';
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

const Explorer = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const history = useHistory();
    const [selectedEmbeddingsName, setSelectedEmbeddingsName] = useState();
    const [clusteringFormChanged, setClusteringFormChanged] = useState(false);
    const [vectorsWithCoordinates, setVectorsWithCoordinates] = useState();
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

    return (
        <>
            {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for analytics</div>}
            <div>
                {
                    datasetId ? (
                        <div className='mb-2'>
                            {
                                datasetId ? (
                                    <LoadingForm className='mt-2' onChange={() => setClusteringFormChanged(true)} onSubmit={async () => {
                                        const vectors = await baseJSONClient.post('/api/metrics/vectors/reduce-dimensions', {
                                            datapoint_filters: filters,
                                            dataset_id: datasetId,
                                            embeddings_name: selectedEmbeddingsName
                                        });

                                        setClusteringFormChanged(false);
                                        setVectorsWithCoordinates(vectors);
                                    }}>
                                        <Row className='g-2'>
                                            <Col>
                                                <Async
                                                    fetchData={() => baseJSONClient.post('/api/predictions/select-distinct-embedding-names', {
                                                        datapointFilters: filters,
                                                        datasetId,
                                                        modelNames
                                                    })}
                                                    refetchOnChanged={[filters, datasetId, modelNames]}
                                                    renderData={(embeddingNames) => (
                                                        <Select required value={selectedEmbeddingsName} defaultValue='' onChange={setSelectedEmbeddingsName}>
                                                            <option value='' disabled>{
                                                                embeddingNames.length ? 'Select an embedding' : 'No embeddings available'
                                                            }</option>
                                                            {embeddingNames.map((embeddingName) => (
                                                                <option key={embeddingName} value={embeddingName}>{embeddingName}</option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                            </Col>
                                            <Col>
                                                <LoadingForm.Button disabled={!clusteringFormChanged} variant='secondary' type='submit' className='w-100'>Run embeddings analysis</LoadingForm.Button>
                                            </Col>
                                        </Row>
                                    </LoadingForm>
                                ) : null
                            }
                        </div>
                    ) : null
                }
                {
                    datasetId ? (
                        <div className='mb-2'>
                            {vectorsWithCoordinates ? (
                                <ScatterChart
                                    height={400}
                                    data={vectorsWithCoordinates}
                                    onSelectedDataChange={(vectors, e) => {
                                        if (e?.shiftKey) {
                                            const selectedIds = new Set(selectedDatapointIds);

                                            if (vectors.length === 1 && selectedIds.has(vectors[0]['datapoint_id'])) {
                                                selectedIds.delete(vectors[0]['datapoint_id']);
                                            } else {
                                                vectors.forEach((v) => selectedIds.add(v['datapoint_id']));
                                            }

                                            onSelectedDatapointIdsChange(selectedIds);
                                        } else {
                                            onSelectedDatapointIdsChange(new Set(vectors.map((v) => v['datapoint_id'])));
                                        }
                                    }}
                                    isDatapointSelected={(v) => selectedDatapointIds.has(v['datapoint_id'])}
                                    getColor={(v) => {
                                        if (selectedDatapointIds.has(v['datapoint_id'])) {
                                            return theme.primary;
                                        } else {
                                            return getHexColor('');
                                        }
                                    }}
                                />
                            ) : null}
                        </div>
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
    datasetId: PropTypes.string,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedDatapointIds: PropTypes.instanceOf(Set).isRequired,
    onSelectedDatapointIdsChange: PropTypes.func.isRequired
};

export default Explorer;
