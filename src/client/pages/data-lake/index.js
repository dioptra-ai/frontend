import {useHistory} from 'react-router-dom';
import {JsonParam, StringParam, useQueryParam} from 'use-query-params';
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

import Metrics from './metrics';

const DataLake = () => {
    const [filters, setFilters] = useQueryParam('filters', JsonParam);
    const [datasetId, setDatasetId] = useQueryParam('datasetId', StringParam);
    const history = useHistory();

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='text-dark p-3'>
                <h4>Data Lake</h4>
                <Row className='g-2'>
                    <Col sm={2}>
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
                    <Col>
                        <FilterInput value={filters} onChange={setFilters} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Metrics filters={filters} datasetId={datasetId} />
                    </Col>
                </Row>
                <DatapointsViewer filters={filters} datasetId={datasetId} renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                    <DatasetSelector allowNew title='Add selected to dataset' onChange={async (datasetId) => {
                        await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                        history.push(`/dataset/${datasetId}`);
                    }}>
                        Add selected to dataset
                    </DatasetSelector>
                ) : null} />
            </div>
        </Menu>
    );
};

export default setupComponent(DataLake);
