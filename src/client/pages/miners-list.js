import metricsClient from 'clients/metrics';
import Menu from 'components/menu';
import moment from 'moment';
import GeneralSearchBar from 'pages/common/general-search-bar';
import {useEffect, useState} from 'react';
import Table from 'react-bootstrap/Table';
import {IoDownloadOutline} from 'react-icons/io5';
import {BarLoader} from 'react-spinners';
import baseJSONClient from 'clients/base-json-client';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {saveAs} from 'file-saver';

const MinersList = () => {
    const [miners, setMiners] = useState();

    const downloadDatapoints = async (minerId) => {
        return metricsClient(`miner/datapoints?id=${minerId}`, null, 'get');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchMiners().then((miners) => setMiners(miners));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchMiners().then((miners) => setMiners(miners));
    }, []);

    const fetchMiners = () => baseJSONClient('/api/metrics/miners', {memoized: false});

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
                            <th className='text-secondary'>Updated At</th>
                            <th className='text-secondary'>Status</th>
                            <th className='text-secondary'>Type</th>
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
                                        <td>
                                            {miner.updated_at && new Date(
                                                moment(miner.updated_at)
                                            ).toLocaleString()}
                                        </td>
                                        <td>{miner.status}</td>
                                        <td>{miner.type}</td>
                                        <td
                                            className='d-flex justify-content-end'
                                            style={{height: 50}}
                                        >
                                            <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                {miner.status === 'pending' ? (
                                                    <BarLoader loading size={40} />
                                                ) : (
                                                    miner.status !== 'error' && (
                                                        <OverlayTrigger overlay={
                                                            <Tooltip>
                                                                {(miner.size && miner.size !== 0) ? 'Download datapoints' : 'There are no datapoints to download'}
                                                            </Tooltip>
                                                        }>
                                                            <IoDownloadOutline
                                                                className={`fs-3 ${(miner.size && miner.size !== 0) ? 'cursor-pointer' : ''}`}
                                                                style={(miner.size && miner.size !== 0) ? {} : {opacity: 0.2}}
                                                                onClick={async () => {
                                                                    const datapoints = await downloadDatapoints(miner._id);

                                                                    saveAs(new Blob([datapoints], {type: 'text/csv;charset=utf-8'}), 'classes.csv');
                                                                }}
                                                            />
                                                        </OverlayTrigger>
                                                    )
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
