import Table from 'react-bootstrap/Table';
import {Button} from 'react-bootstrap';

import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import Menu from 'components/menu';
import baseJSONClient from 'clients/base-json-client';

const DatasetsList = () => {

    return (
        <Menu>
            <TopBar hideTimePicker/>
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
                    fetchData={() => baseJSONClient('/api/datasets')}
                    renderData={(datasets) => (
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th className='text-secondary'>ID</th>
                                    <th className='text-secondary'>Name</th>
                                    <th className='text-secondary'>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasets.map(({uuid, display_name, created_at}, i) => (
                                    <tr className='cursor-pointer' key={i}>
                                        <td className='text-dark'>{uuid}</td>
                                        <td>{display_name}</td>
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
