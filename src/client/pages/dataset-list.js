import {useState} from 'react';
import Table from 'react-bootstrap/Table';
import {useHistory} from 'react-router-dom';
import {Button, Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {AiOutlineDelete} from 'react-icons/ai';

import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import Menu from 'components/menu';
import baseJSONClient from 'clients/base-json-client';
import {DatasetEditModal} from 'components/dataset-modal';

const DatasetList = () => {
    const history = useHistory();
    const [lastUpdated, setLastUpdated] = useState(0);
    const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState(new Set());

    return (
        <Menu>
            <TopBar hideTimePicker/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Datasets</span>
                    <Button
                        className='py-3 fs-6 bold-text px-5 text-white'
                        onClick={() => setIsDatasetModalOpen(true)}
                        variant='primary'
                    >
                        CREATE NEW DATASET
                    </Button>
                </div>
                <Async
                    fetchData={() => baseJSONClient('/api/dataset')}
                    refetchOnChanged={[lastUpdated]}
                    renderData={(datasets) => (
                        <>
                            <div className='d-flex align-items-center mt-4'>
                                <Form.Check
                                    id='select-all'
                                    type='checkbox'
                                    label='Select all'
                                    checked={selectedRows.size === datasets.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(new Set(datasets.map(({uuid}) => uuid)));
                                        } else {
                                            setSelectedRows(new Set());
                                        }
                                    }}
                                />
                                {
                                    <a className='ms-2' style={{color: 'red'}} onClick={
                                        async () => {
                                            if (selectedRows.size && confirm(`Do you really want to delete ${selectedRows.size} datasets?\nThis action cannot be undone.`)) {
                                                await Promise.all(Array.from(selectedRows).map((uuid) => baseJSONClient.delete(`/api/dataset/${uuid}`)));
                                                setLastUpdated(Date.now());
                                            }
                                        }
                                    }>
                                        Delete Selected
                                    </a>
                                }
                            </div>
                            <Table className='models-table mt-3'>
                                <thead className='align-middle text-secondary'>
                                    <tr className='border-0 border-bottom border-mercury'>
                                        <th></th>
                                        <th className='text-secondary'>Name</th>
                                        <th className='text-secondary'>Latest Version Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.map(({uuid, display_name, created_at}, i) => (
                                        <tr className='cursor-pointer' key={i} onClick={() => history.push(`/dataset/${uuid}`)}>
                                            <td className='text-center'>
                                                <Form.Check type='checkbox' checked={selectedRows.has(uuid)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const newSelectedRows = new Set(selectedRows);

                                                        if (e.target.checked) {
                                                            newSelectedRows.add(uuid);
                                                        } else {
                                                            newSelectedRows.delete(uuid);
                                                        }
                                                        setSelectedRows(newSelectedRows);
                                                    }}
                                                />
                                            </td>
                                            <td>{display_name}</td>
                                            <td>{new Date(created_at).toLocaleString()}</td>
                                            <td>
                                                <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                    <OverlayTrigger overlay={
                                                        <Tooltip>Delete this dataset</Tooltip>
                                                    }>
                                                        <AiOutlineDelete
                                                            className='fs-3 cursor-pointer'
                                                            onClick={async (e) => {
                                                                e.stopPropagation();

                                                                if (confirm('Do you really want to delete this dataset?\nThis action cannot be undone.')) {

                                                                    await baseJSONClient.delete(`/api/dataset/${uuid}`);
                                                                    setLastUpdated(Date.now());
                                                                }
                                                            }}
                                                        />
                                                    </OverlayTrigger>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                />
            </div>
            <DatasetEditModal
                isOpen={isDatasetModalOpen}
                onClose={() => setIsDatasetModalOpen(false)}
                onDatasetSaved={({uuid}) => {
                    setIsDatasetModalOpen(false);
                    history.push(`/dataset/${uuid}`);
                }}
            />
        </Menu>
    );
};

export default DatasetList;
