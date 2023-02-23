import {useState} from 'react';
import Table from 'react-bootstrap/Table';
import {useHistory} from 'react-router-dom';
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
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
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th className='text-secondary'>Name</th>
                                    <th className='text-secondary'>Latest Version Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasets.map(({uuid, display_name, created_at}, i) => (
                                    <tr className='cursor-pointer' key={i} onClick={() => history.push(`/dataset/${uuid}`)}>
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
