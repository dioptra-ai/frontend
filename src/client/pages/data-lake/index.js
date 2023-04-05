import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import {ArrayParam, JsonParam, StringParam, useQueryParam} from 'use-query-params';
import {Col, Row} from 'react-bootstrap';

import baseJSONClient from 'clients/base-json-client';
import DatapointsViewer from 'components/datapoints-viewer';
import Menu from 'components/menu';
import DatasetSelector from 'pages/dataset/dataset-selector';
import TopBar from 'pages/common/top-bar';
import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import Select from 'components/select';
import Async from 'components/async';

import DatasetMetrics from './dataset-metrics';
import ModelMetrics from './model-metrics';

const DataLake = () => {
    const [filters, setFilters] = useQueryParam('filters', JsonParam);
    const [datasetId, setDatasetId] = useQueryParam('datasetId', StringParam);
    const [modelNames, setModelNames] = useQueryParam('modelNames', ArrayParam);
    const history = useHistory();

    useEffect(() => {
        if (!datasetId) {
            setModelNames(undefined);
        }
    }, [datasetId]);


    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='text-dark p-3'>
                <h4>Data Lake</h4>
                <Row className='g-2'>
                    <Col>
                        <FilterInput value={filters} onChange={setFilters} />
                    </Col>
                    <Col md={2}>
                        <Async
                            fetchData={() => baseJSONClient('/api/dataset')}
                            renderData={(datasets) => (
                                <Select value={datasetId} onChange={setDatasetId}>
                                    <option value=''>No Dataset Selected</option>
                                    {datasets.map((dataset) => (
                                        <option key={dataset['uuid']} value={dataset['uuid']}>
                                            {dataset['display_name']}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Col>
                    {
                        datasetId ? (
                            <Col md={3}>
                                <Async
                                    fetchData={() => baseJSONClient.post('/api/predictions/select-distinct-model-names', {
                                        datapointFilters: filters,
                                        datasetId,
                                        limit: 100
                                    })}
                                    renderData={(allModelNames) => (
                                        <Select multiple value={modelNames} onChange={setModelNames} disabled={!datasetId}>
                                            <option value=''>No Model Names</option>
                                            {allModelNames.map((modelName) => (
                                                <option key={modelName} value={modelName}>
                                                    {modelName}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </Col>
                        ) : null
                    }
                </Row>
                <Row>
                    <Col md={datasetId && modelNames && modelNames.length ? 7 : 12}>
                        {datasetId ? <DatasetMetrics filters={filters} datasetId={datasetId} /> : <div className='text-secondary mt-2 text-center'>Select a Dataset for Metrics</div>}
                        <DatapointsViewer filters={filters} datasetId={datasetId} renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                            <DatasetSelector allowNew title='Add selected to dataset' onChange={async (datasetId) => {
                                await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                                history.push(`/dataset/${datasetId}`);
                            }}>
                                Add selected to dataset
                            </DatasetSelector>
                        ) : null} />
                    </Col>
                    {
                        (datasetId && modelNames && modelNames.length) ? (
                            <Col md={5}>
                                <Row className='g-2 my-2'>
                                    <ModelMetrics filters={filters} datasetId={datasetId} modelNames={modelNames} />
                                </Row>
                            </Col>
                        ) : null
                    }
                </Row>
            </div>
        </Menu>
    );
};

export default setupComponent(DataLake);
