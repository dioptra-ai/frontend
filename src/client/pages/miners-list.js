import metricsClient from 'clients/metrics';
import Menu from 'components/menu';
import moment from 'moment';
import GeneralSearchBar from 'pages/common/general-search-bar';
import {useEffect, useState} from 'react';
import Table from 'react-bootstrap/Table';
import {IoDownloadOutline} from 'react-icons/io5';
import {BarLoader} from 'react-spinners';

const MinersList = () => {
    const [miners, setMiners] = useState();

    const downloadDatapoints = async (minerId) => {
        return await metricsClient(`/miner/datapoints?id=${minerId}`, null, 'get');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchMiners();
        }, 5000);


        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchMiners();
    }, []);

    const fetchMiners = () => metricsClient('miners', null, 'get').then((miners) => setMiners(miners));

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput />
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Miners</span>
                </div>
                <Table className='models-table mt-3'>
                    <thead className='align-middle text-secondary'>
                        <tr className='border-0 border-bottom border-mercury'>
                            <th className='text-secondary'>Miner ID</th>
                            <th className='text-secondary'>Size</th>
                            <th className='text-secondary'>Created At</th>
                            <th className='text-secondary'>Status</th>
                            <th className='text-secondary d-flex justify-content-end'>
                                Download Datapoints
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {miners &&
                            miners.map((miner) => {
                                return (
                                    <tr key={miner._id}>
                                        <td>{miner._id}</td>
                                        <td>{miner.size}</td>
                                        <td>
                                            {new Date(
                                                moment(miner.created_at)
                                            ).toLocaleString()}
                                        </td>
                                        <td>{miner.status}</td>
                                        <td
                                            className='d-flex justify-content-end'
                                            style={{height: 50}}
                                        >
                                            <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                {miner.status === 'pending' ? (
                                                    <BarLoader loading size={40} />
                                                ) : (
                                                    <IoDownloadOutline
                                                        className='fs-3 cursor-pointer'
                                                        onClick={async () => {
                                                            const datapoints = await downloadDatapoints(miner._id);
                                                            saveAs(new Blob([datapoints], {type: 'application/json;charset=utf-8'}), 'datapoints.json');
                                                        }
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </Table>
            </div>
        </Menu>
    );
};

export default MinersList;
