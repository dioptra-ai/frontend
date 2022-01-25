import Table from 'react-bootstrap/Table';
import {useHistory} from 'react-router-dom';

import Async from 'components/async';
import GeneralSearchBar from './templates/general-search-bar';
import metricsClient from 'clients/metrics';
import {setupComponent} from 'helpers/component-helper';


const Experimentations = ({filtersStore, modelStore}) => {
    const history = useHistory();

    return (
        <>
            <GeneralSearchBar shouldShowOnlySearchInput/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Benchmarks</span>
                </div>
                <Async
                    fetchData={() => metricsClient('benchmarks', null, 'get')}
                    renderData={(benchmarks) => (
                        <Table className='models-table'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th>Benchmark ID</th>
                                    <th>Dataset ID</th>
                                    <th>Model</th>
                                    <th>Model Version</th>
                                    <th>Started At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benchmarks.map(({benchmark_id, dataset_id, model_id, model_version, started_at}, i) => (
                                    <tr className='cursor-pointer' onClick={() => {
                                        filtersStore.filters = [{
                                            left: 'model_id',
                                            op: '=',
                                            right: model_id
                                        }, {
                                            left: 'model_version',
                                            op: '=',
                                            right: model_version
                                        }, {
                                            left: 'dataset_id',
                                            op: '=',
                                            right: dataset_id
                                        }, {
                                            left: 'benchmark_id',
                                            op: '=',
                                            right: benchmark_id
                                        }];

                                        history.push('/benchmarks/performance');
                                    }} key={i}>
                                        <td>{benchmark_id}</td>
                                        <td>{dataset_id}</td>
                                        <td>{modelStore.models.find((m) => m.mlModelId === model_id)?.name || '<unknown>'}</td>
                                        <td>{model_version}</td>
                                        <td>{new Date(started_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                />
            </div>
        </>
    );
};

export default setupComponent(Experimentations);
