import {useEffect} from 'react';
import {useHistory} from 'react-router-dom';
import {ArrayParam, JsonParam, StringParam, useQueryParam, withDefault} from 'use-query-params';
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

import DataLakeDistributions from './distributions';
import ModelMetrics from './model-metrics';
import {getHexColor} from 'helpers/color-helper';

const ArrayParamDefaultEmpty = withDefault(ArrayParam, []);
const JsonParamDefaultEmptyArray = withDefault(JsonParam, []);

const DataLake = () => {
    const [filters, setFilters] = useQueryParam('filters', JsonParamDefaultEmptyArray);
    const [datasetId, setDatasetId] = useQueryParam('datasetId', StringParam);
    const [modelNames, setModelNames] = useQueryParam('modelNames', ArrayParamDefaultEmpty);
    const history = useHistory();
    const filtersWithModelNames = modelNames.length ? filters.concat([{
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames
    }]) : filters;

    useEffect(() => {
        if (!datasetId) {
            setModelNames(undefined);
        }
    }, [datasetId]);


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
                    <Col md={3}>
                        <Async
                            fetchData={() => datasetId ? baseJSONClient.post('/api/predictions/select-distinct-model-names', {
                                datapointFilters: filters,
                                datasetId,
                                limit: 100
                            }) : Promise.resolve([])}
                            refetchOnChanged={[filters, datasetId]}
                            renderData={(allModelNames) => (
                                <Select multiple value={modelNames} onChange={setModelNames} disabled={!datasetId}>
                                    <option value=''>{datasetId ? 'All models' : 'Select a dataset for models'}</option>
                                    {allModelNames.map((modelName) => (
                                        <option key={modelName} value={modelName} style={{color: getHexColor(modelName)}}>
                                            {modelName}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={datasetId ? 7 : 12}>
                        {datasetId ? null : <div className='text-secondary mt-2 text-center'>Select a dataset for metrics</div>}
                        <DatapointsViewer
                            filters={filtersWithModelNames} datasetId={datasetId} modelNames={modelNames}
                            renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                                <DatasetSelector
                                    allowNew title='Add selected to dataset'
                                    onChange={async (datasetId) => {
                                        await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                                        history.push(`/dataset/${datasetId}`);
                                    }}
                                >
                                    Add selected to dataset
                                </DatasetSelector>
                            ) : null}
                        />
                    </Col>
                    {
                        datasetId ? (
                            <Col md={5}>
                                <DataLakeDistributions filters={filters} datasetId={datasetId} modelNames={modelNames} />
                                {
                                    modelNames?.length ? (
                                        <ModelMetrics filters={filters} datasetId={datasetId} modelNames={modelNames} />
                                    ) : null
                                }
                            </Col>
                        ) : null
                    }
                </Row>
            </div>
        </Menu>
    );
};

export default setupComponent(DataLake);
