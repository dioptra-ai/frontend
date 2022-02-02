import Table from 'react-bootstrap/Table';

import Async from 'components/async';
import GeneralSearchBar from 'pages/common/general-search-bar';
import metricsClient from 'clients/metrics';
import Menu from 'components/menu';

const DatasetsList = () => {

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Datasets</span>
                </div>
                <Async
                    fetchData={() => metricsClient('datasets', null, 'get')}
                    renderData={(benchmarks) => (
                        <Table className='models-table'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th>Dataset ID</th>
                                    <th>Size</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benchmarks.map(({dataset_id, size, created_at}, i) => (
                                    <tr className='cursor-pointer' key={i}>
                                        <td>{dataset_id}</td>
                                        <td>{size.toLocaleString()}</td>
                                        <td>{new Date(created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                />
            </div>
        </Menu>
    );
};

export default DatasetsList;
