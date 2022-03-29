import metricsClient from 'clients/metrics';
import Async from 'components/async';
import Menu from 'components/menu';
import GeneralSearchBar from 'pages/common/general-search-bar';
import Table from 'react-bootstrap/Table';
import {IoDownloadOutline} from 'react-icons/io5';
import moment from 'moment';

const MinersList = () => {
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
                            <th className='text-secondary d-flex justify-content-end'>
                                Download Datapoints
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <Async
                            fetchData={[() => metricsClient('miners', null, 'get')]}
                            renderData={(miners) => {
                                return miners && miners[0].map((miner) => {
                                    return (
                                        <tr className='cursor-pointer' key={miner._id}>
                                            <td>{miner._id}</td>
                                            <td>{miner.size}</td>
                                            <td>
                                                {new Date(
                                                    moment(miner.created_at)
                                                ).toLocaleString()}
                                            </td>
                                            <td className='d-flex justify-content-end'>
                                                <IoDownloadOutline className='fs-2' />
                                            </td>
                                        </tr>
                                    );
                                });
                            }}
                        />
                    </tbody>
                </Table>
            </div>
        </Menu>
    );
};

export default MinersList;
