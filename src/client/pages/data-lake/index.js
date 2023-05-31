import {useEffect, useState} from 'react';
import {ArrayParam, JsonParam, StringParam, useQueryParam, withDefault} from 'use-query-params';
import {Button, Col, Row} from 'react-bootstrap';
import baseJSONClient from 'clients/base-json-client';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import Select from 'components/select';
import Async from 'components/async';
import ModalComponent from 'components/modal';
import UploadData from 'components/upload-data';

import DataLakeDistributions from './distributions';
import ModelMetrics from './model-metrics';
import {getHexColor} from 'helpers/color-helper';
import Explorer from './explorer';

const ArrayParamDefaultEmpty = withDefault(ArrayParam, []);
const JsonParamDefaultEmptyArray = withDefault(JsonParam, []);

const DataLake = () => {
    const [filters, setFilters] = useQueryParam('filters', JsonParamDefaultEmptyArray);
    const [datasetId, setDatasetId] = useQueryParam('datasetId', StringParam);
    const [modelNames, setModelNames] = useQueryParam('modelNames', ArrayParamDefaultEmpty);
    const [showUploadDataModal, setShowUploadDataModal] = useState(false);
    const [selectedDatapointIds, setSelectedDatapointIds] = useState(new Set());

    useEffect(() => {
        if (!datasetId) {
            setModelNames(undefined);
        }
    }, [datasetId]);

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='text-dark p-3' id='joyride-5'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                    <h4 className='0'>Data Lake</h4>
                    <Button id='joyride-1'
                        onClick={() => setShowUploadDataModal(true)}
                        variant='secondary' size='s' className='text-nowrap'
                    >Upload Data</Button>
                    <ModalComponent isOpen={showUploadDataModal} onClose={() => setShowUploadDataModal(false)} title='Upload Data'>
                        <UploadData onDone={() => setShowUploadDataModal(false)} />
                    </ModalComponent>
                </div>
                <Row className='g-2'>
                    <Col>
                        <FilterInput value={filters} onChange={setFilters} />
                    </Col>
                    <Col md={2}>
                        <Async
                            fetchData={() => baseJSONClient('/api/dataset')}
                            renderData={(datasets) => (
                                <Select value={datasetId} onChange={setDatasetId} name='select-dataset'>
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
                        <Explorer
                            filters={filters}
                            datasetId={datasetId}
                            modelNames={modelNames}
                            selectedDatapointIds={selectedDatapointIds}
                            onSelectedDatapointIdsChange={setSelectedDatapointIds}
                        />
                    </Col>
                    {
                        datasetId ? (
                            <Col md={5}>
                                <DataLakeDistributions filters={filters} setFilters={setFilters} datasetId={datasetId} modelNames={modelNames} selectedDatapointIds={selectedDatapointIds}
                                    onSelectedDatapointIdsChange={setSelectedDatapointIds} />
                                {
                                    modelNames?.length ? (
                                        <ModelMetrics filters={filters} datasetId={datasetId} modelNames={modelNames} selectedDatapointIds={selectedDatapointIds}
                                            onSelectedDatapointIdsChange={setSelectedDatapointIds} />
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
