import Table from 'react-bootstrap/Table';
import moment from 'moment';
import {IoDownloadOutline} from 'react-icons/io5';

import GeneralSearchBar from 'pages/common/general-search-bar';
import Menu from 'components/menu';

const MinersList = () => {

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput/>
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
                            <th className='text-secondary d-flex justify-content-end'>Download Datapoints</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[{
                            minerId: 'dad109ea-2bb1-4a56-9bdb-cbc08fcb57a0',
                            size: 253297,
                            createdAt: moment().subtract(1, 'hours')
                        }, {
                            minerId: '76ead7dc-9d53-4898-a9ed-b3823945ddc6',
                            size: 45634,
                            createdAt: moment().subtract(22, 'hours')
                        }, {
                            minerId: '89e347ab-b3ee-494d-a878-2190fe52ce63',
                            size: 6454,
                            createdAt: moment().subtract(45, 'hours')
                        }, {
                            minerId: '6d9f14c8-9eb2-40c7-8ba6-5f45469cd012',
                            size: 2234,
                            createdAt: moment().subtract(62, 'hours')
                        }, {
                            minerId: 'c0d46f37-881b-4852-a471-a2dd130a7c95',
                            size: 342,
                            createdAt: moment().subtract(91, 'hours')
                        }, {
                            minerId: 'd9e34b3f-3328-466a-8100-557bd7d2f3f1',
                            size: 6890,
                            createdAt: moment().subtract(100, 'hours')
                        }].map(({minerId, size, createdAt}, i) => (
                            <tr className='cursor-pointer' key={i}>
                                <td>{minerId}</td>
                                <td>{size.toLocaleString()}</td>
                                <td>{new Date(createdAt).toLocaleString()}</td>
                                <td className='d-flex justify-content-end'><IoDownloadOutline className='fs-2'/></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Menu>
    );
};

export default MinersList;
