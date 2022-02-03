import {useState} from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {useHistory} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';

import Async from 'components/async';
import GeneralSearchBar from 'pages/common/general-search-bar';
import metricsClient from 'clients/metrics';
import {setupComponent} from 'helpers/component-helper';
import ModalComponent from 'components/modal';
import Select from 'components/select';
import useStores from 'hooks/use-stores';
import Spinner from 'components/spinner';

const BenchmarksList = () => {
    const {filtersStore, modelStore, benchmarkStore} = useStores();
    const history = useHistory();
    const [isRunBenchmarkOpen, setIsRunBenchmarkOpen] = useState(false);
    const [newBenchmarkModelId, setNewBenchmarkModelId] = useState(null);
    const allModels = modelStore.models;

    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput/>
            {benchmarkStore.state === benchmarkStore.STATE_PENDING ? (
                <Spinner/>
            ) : (
                <div className='p-4 mt-5'>
                    <div className='d-flex justify-content-between'>
                        <span className='h2 fs-1 text-dark bold-text'>Benchmarks</span>
                        <Button
                            className='py-3 fs-6 bold-text px-5 text-white'
                            onClick={() => setIsRunBenchmarkOpen(true)}
                            variant='primary'
                        >
                            RUN NEW BENCHMARK
                        </Button>
                    </div>
                    <Table className='models-table mt-3'>
                        <thead className='align-middle'>
                            <tr className='border-0 border-bottom border-mercury'>
                                <th className='text-secondary'>Benchmark ID</th>
                                <th className='text-secondary'>Dataset ID</th>
                                <th className='text-secondary'>Model</th>
                                <th className='text-secondary'>Model Version</th>
                                <th className='text-secondary'>Started At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {benchmarkStore.benchmarks.map((benchmark, i) => (
                                <tr className='cursor-pointer' onClick={() => {

                                    filtersStore.benchmarks = [benchmark];
                                    history.push('/benchmark/performance');
                                }} key={i}>
                                    <td>{benchmark['benchmark_id']}</td>
                                    <td>{benchmark['dataset_id']}</td>
                                    <td>{modelStore.getModelByMlModelId(benchmark['model_id'])?.name || '<unknown>'}</td>
                                    <td>{benchmark['model_version']}</td>
                                    <td>{new Date(benchmark['started_at']).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

            )}
            <ModalComponent isOpen={isRunBenchmarkOpen} onClose={() => setIsRunBenchmarkOpen(false)} title='Run New Benchmark'>
                <Form style={{width: 500}}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Model</Form.Label>
                        <Select
                            onChange={setNewBenchmarkModelId}
                            options={[{name: 'Choose Model'}].concat(allModels.map((m) => ({
                                name: m.name,
                                value: m._id
                            })))}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Model Version</Form.Label>
                        <Async
                            refetchOnChanged={[newBenchmarkModelId]}
                            fetchData={() => metricsClient('queries/all-ml-model-versions', {
                                ml_model_id: modelStore.getModelById(newBenchmarkModelId)?.mlModelId
                            })}
                            renderData={(data) => (
                                <Select options={data.map((d) => ({
                                    name: d.mlModelVersion,
                                    value: d.mlModelVersion
                                }))}/>
                            )}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Dataset</Form.Label>
                        <Async
                            fetchData={() => metricsClient('datasets', null, 'get')}
                            renderData={(benchmarks) => (
                                <Select options={benchmarks.map(({dataset_id, created_at}) => ({
                                    name: `${dataset_id} @ ${new Date(created_at).toLocaleDateString()}`,
                                    value: dataset_id
                                }))}/>
                            )}
                        />
                    </Form.Group>
                    <Row>
                        <Col>
                            <Button
                                className='w-100 text-white btn-submit mt-3 py-2'
                                variant='secondary'
                                onClick={() => setIsRunBenchmarkOpen(false)}
                            >
                                Cancel
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                className='w-100 text-white btn-submit mt-3 py-2'
                                variant='primary' type='submit'
                            >
                                Run Benchmark
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </ModalComponent>
        </>
    );
};

BenchmarksList.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(BenchmarksList);
