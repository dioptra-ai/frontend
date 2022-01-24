import Table from 'react-bootstrap/Table';

import Async from 'components/async';
import GeneralSearchBar from './templates/general-search-bar';
import metricsClient from 'clients/metrics';


const Experimentations = () => {

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
                                    <th>Dataset ID</th>
                                    <th>Model ID</th>
                                    <th>Model Version</th>
                                    <th>Started At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benchmarks.map(({model_id, model_version, started_at}, i) => (
                                    <tr key={i}>
                                        <td></td>
                                        <td>{model_id}</td>
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

export default Experimentations;
