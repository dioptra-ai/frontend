import {useHistory} from 'react-router-dom';
import {Button, Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {AiOutlineDelete} from 'react-icons/ai';

import Menu from 'components/menu';
import Async from 'components/async';
import MinerModal from 'components/miner-modal';
import moment from 'moment';
import {useState} from 'react';
import Table from 'react-bootstrap/Table';
import baseJSONClient from 'clients/base-json-client';

const MinersList = () => {
    const [isMinerModalOpen, setIsMinerModalOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(0);
    const history = useHistory();
    const [selectedRows, setSelectedRows] = useState(new Set());

    return (
        <Async
            fetchData={() => baseJSONClient('/api/tasks/miners')}
            refetchOnChanged={[lastUpdated]}
            renderData={(miners) => (
                <Menu>
                    <div className='p-4 mt-5'>
                        <div className='d-flex justify-content-between'>
                            <span className='h2 fs-1 text-dark bold-text'>Miners</span>
                            <Button
                                className='py-3 fs-6 bold-text px-5 text-white'
                                onClick={() => setIsMinerModalOpen(true)}
                                variant='primary'
                            >
                                CREATE NEW MINER
                            </Button>
                        </div>
                        <div className='d-flex align-items-center mt-4'>
                            <Form.Check
                                id='select-all'
                                type='checkbox'
                                label='Select all'
                                checked={miners.length && (selectedRows.size === miners.length)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRows(new Set(miners.map(({_id}) => _id)));
                                    } else {
                                        setSelectedRows(new Set());
                                    }
                                }}
                            />
                            {
                                <a className='ms-2' onClick={
                                    async () => {
                                        if (selectedRows.size && confirm(`Do you really want to delete ${selectedRows.size} miners?\nThis action cannot be undone.`)) {

                                            await Promise.all(Array.from(selectedRows).map((id) => baseJSONClient.post('/api/tasks/miners/delete', {
                                                miner_id: id
                                            })));
                                            setLastUpdated(Date.now());
                                        }
                                    }
                                }>
                                    <AiOutlineDelete className='fs-3 cursor-pointer'/>
                                </a>
                            }
                        </div>
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th></th>
                                    <th className='text-secondary'>Name</th>
                                    <th className='text-secondary'>Created At</th>
                                    <th className='text-secondary'>Strategy</th>
                                    <th className='text-secondary'>Last Run</th>
                                    <th className='text-secondary'>Status</th>
                                    <th className='text-secondary'>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {miners &&
                                    miners.map((miner) => {
                                        return (
                                            <tr key={miner._id} className='cursor-pointer' onClick={() => history.push(`/miners/${miner._id}`)}>
                                                <td className='text-center'>
                                                    <Form.Check type='checkbox' checked={selectedRows.has(miner._id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            const newSelectedRows = new Set(selectedRows);

                                                            if (e.target.checked) {
                                                                newSelectedRows.add(miner._id);
                                                            } else {
                                                                newSelectedRows.delete(miner._id);
                                                            }
                                                            setSelectedRows(newSelectedRows);
                                                        }}
                                                    />
                                                </td>
                                                <td>{miner.display_name}</td>
                                                <td>
                                                    {new Date(moment(miner.created_at)).toLocaleString()}
                                                </td>
                                                <td>{miner.strategy}</td>
                                                <td>
                                                    {miner.task?.['done_at'] && new Date(miner.task?.['done_at']).toLocaleString() || 'N/A'}
                                                </td>
                                                <td>{miner.task?.['status']}</td>
                                                <td>
                                                    {miner.task?.['result_size'] || 0}{' '}
                                                </td>
                                                <td>
                                                    <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                        <OverlayTrigger overlay={
                                                            <Tooltip>Delete this miner</Tooltip>
                                                        }>
                                                            <AiOutlineDelete
                                                                className='fs-3 cursor-pointer'
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();

                                                                    await baseJSONClient.post('/api/tasks/miners/delete', {
                                                                        miner_id: miner._id
                                                                    });
                                                                    setLastUpdated(Date.now());
                                                                }}
                                                            />
                                                        </OverlayTrigger>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </Table>
                    </div>
                    <MinerModal
                        isOpen={isMinerModalOpen}
                        onMinerSaved={(minerId) => {
                            setIsMinerModalOpen(false);
                            history.push(`/miners/${minerId}`);
                        }}
                        onClose={() => setIsMinerModalOpen(false)}
                    />
                </Menu>
            )}
        />
    );
};

export default MinersList;
