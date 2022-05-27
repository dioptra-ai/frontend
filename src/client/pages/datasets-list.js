import Table from 'react-bootstrap/Table';
import {Button} from 'react-bootstrap';

import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import metricsClient from 'clients/metrics';
import Menu from 'components/menu';

const DatasetsList = () => {

    return (
        <Menu>
            <TopBar showTimePicker/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Datasets</span>
                    <Button
                        className='py-3 fs-6 bold-text px-5 text-white'
                        onClick={() => console.log('nothing')}
                        variant='primary'
                    >
                        CREATE NEW DATASET
                    </Button>
                </div>
                <Async
                    fetchData={() => metricsClient('datasets', null, 'get')}
                    renderData={(benchmarks) => (
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th className='text-secondary'>Dataset ID</th>
                                    <th className='text-secondary'>Size</th>
                                    <th className='text-secondary'>Created At</th>
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
