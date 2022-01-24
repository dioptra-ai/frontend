import Table from 'react-bootstrap/Table';
<<<<<<< HEAD
import {useHistory} from 'react-router-dom';
=======
>>>>>>> 595dc5d (WIP)

import Async from 'components/async';
import GeneralSearchBar from './templates/general-search-bar';
import metricsClient from 'clients/metrics';
<<<<<<< HEAD
import {setupComponent} from 'helpers/component-helper';


const Experimentations = ({filtersStore, modelStore}) => {
    const history = useHistory();
=======


const Experimentations = () => {
>>>>>>> 595dc5d (WIP)

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
<<<<<<< HEAD
                                    <th>Benchmark ID</th>
                                    <th>Dataset ID</th>
                                    <th>Model</th>
=======
                                    <th>Dataset ID</th>
                                    <th>Model ID</th>
>>>>>>> 595dc5d (WIP)
                                    <th>Model Version</th>
                                    <th>Started At</th>
                                </tr>
                            </thead>
                            <tbody>
<<<<<<< HEAD
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
=======
                                {benchmarks.map(({model_id, model_version, started_at}, i) => (
                                    <tr key={i}>
                                        <td></td>
                                        <td>{model_id}</td>
>>>>>>> 595dc5d (WIP)
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

<<<<<<< HEAD
export default setupComponent(Experimentations);
=======
export default Experimentations;
>>>>>>> 595dc5d (WIP)
