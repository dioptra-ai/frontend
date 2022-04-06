import metricsClient from 'clients/metrics';
import Menu from 'components/menu';
import Async from 'components/async';
import moment from 'moment';
import GeneralSearchBar from 'pages/common/general-search-bar';
import {useEffect, useState} from 'react';
import Table from 'react-bootstrap/Table';
import {IoDownloadOutline} from 'react-icons/io5';
import {AiOutlineDelete} from 'react-icons/ai';
import {BarLoader} from 'react-spinners';
import baseJSONClient from 'clients/base-json-client';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {saveAs} from 'file-saver';

const MinersList = () => {
    const [miners, setMiners] = useState();

    const downloadDatapoints = (minerId) => {
        return metricsClient(`miner/datapoints?id=${minerId}`, null, 'get');
    };

    const fetchMiners = () => baseJSONClient('/api/metrics/miners', {memoized: false}).then((miners) => setMiners(miners));

    useEffect(fetchMiners, []);


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
                            <th className='text-secondary'>Name</th>
                            <th className='text-secondary'>Created At</th>
                            <th className='text-secondary'>Updated At</th>
                            <th className='text-secondary'>Status</th>
                            <th className='text-secondary'>Type</th>
                            <th className='text-secondary'>Size</th>
                            <th className='text-secondary'>
                                Download
                            </th>
                            <th className='text-secondary d-flex justify-content-end'>
                                Delete
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {miners &&
                            miners.map((miner) => {
                                return (
                                    <tr key={miner._id}>
                                        <td>{miner.display_name}</td>
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
                                        <Async
                                            fetchData={() => metricsClient(`miners/size?id=${miner._id}`, null, 'get')}
                                            renderData={({size}) => (
                                                <>
                                                    <td>{Number(size).toLocaleString()}</td>
                                                    <td>
                                                        <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                            {miner.status === 'pending' ? (
                                                                <BarLoader loading size={40} />
                                                            ) : (
                                                                miner.status !== 'error' && (
                                                                    <OverlayTrigger overlay={
                                                                        <Tooltip>
                                                                            {size ? 'Download datapoints' : 'There are no datapoints to download'}
                                                                        </Tooltip>
                                                                    }>
                                                                        <IoDownloadOutline
                                                                            className={`fs-3 ${size ? 'cursor-pointer' : ''}`}
                                                                            style={{opacity: size ? 1 : 0.2}}
                                                                            onClick={async () => {
                                                                                if (size) {
                                                                                    const datapoints = await downloadDatapoints(miner._id);

                                                                                    saveAs(new Blob([datapoints], {type: 'text/csv;charset=utf-8'}), `${miner._id}-data.csv`);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </OverlayTrigger>
                                                                )
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        />
                                        <td>
                                            <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                <OverlayTrigger overlay={
                                                    <Tooltip>Delete this miner</Tooltip>
                                                }>
                                                    <AiOutlineDelete
                                                        className='fs-3 cursor-pointer'
                                                        onClick={async () => {
                                                            await metricsClient('miners/delete', {
                                                                miner_id: miner._id
                                                            });
                                                            await fetchMiners();
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
        </Menu>
    );
};

export default MinersList;
