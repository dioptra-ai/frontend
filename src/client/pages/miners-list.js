import {useHistory} from 'react-router-dom';
import Menu from 'components/menu';
import Async from 'components/async';
import MinerModal from 'components/miner-modal';
import moment from 'moment';
import TopBar from 'pages/common/top-bar';
import {useState} from 'react';
import Table from 'react-bootstrap/Table';
import {Button} from 'react-bootstrap';
import baseJSONClient from 'clients/base-json-client';

const MinersList = () => {
    const [isMinerModalOpen, setIsMinerModalOpen] = useState(false);
    const history = useHistory();

    return (
        <Async
            fetchData={() => baseJSONClient('/api/tasks/miners')}
            renderData={(miners) => (
                <Menu>
                    <TopBar hideTimePicker />
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
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
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
