import {useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import {saveAs} from 'file-saver';
import slugify from 'slugify';

import MinerModal from 'components/miner-modal';
import Menu from 'components/menu';
import Async from 'components/async';
import PreviewDetails from 'components/preview-details';
import baseJSONClient from 'clients/base-json-client';
import DatasetSelector from 'pages/dataset/dataset-selector';
import DatapointsViewer from 'components/datapoints-viewer';

const Miner = () => {
    const history = useHistory();
    const {minerId} = useParams();
    const [isMinerModalOpen, setIsMinerModalOpen] = useState(false);
    const [lastRequestedRefresh, setLastRequestedRefresh] = useState(0);
    const handleRunMiner = async () => {
        await baseJSONClient('/api/tasks/miner/run', {
            method: 'post',
            body: {miner_id: minerId}
        });
        setLastRequestedRefresh(Date.now());
    };
    const handleResetMiner = async (confirmed) => {
        if (confirmed || window.confirm('Do you really want to reset this miner?\nThis will delete the results.')) {
            await baseJSONClient('/api/tasks/miner/reset', {
                method: 'post',
                body: {miner_id: minerId}
            });
            setLastRequestedRefresh(Date.now());
        }
    };
    const handleDeleteMiner = async () => {

        if (window.confirm('Do you really want to delete this miner?\nThis action cannot be undone.')) {
            await baseJSONClient('/api/tasks/miners/delete', {
                method: 'post',
                body: {miner_id: minerId}
            });
            history.push('/miners');
        }
    };

    return (
        <Menu>
            <Async
                fetchData={() => baseJSONClient(`/api/tasks/miners/${minerId}`, {memoized: false})}
                refetchOnChanged={[minerId, lastRequestedRefresh]}
                renderData={(miner) => (
                    <>
                        {isMinerModalOpen ? (
                            <MinerModal
                                isOpen
                                onMinerSaved={() => {
                                    setIsMinerModalOpen(false);
                                    handleResetMiner(true);
                                }}
                                onClose={() => setIsMinerModalOpen(false)}
                                defaultMiner={miner}
                            />
                        ) : null}
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{miner['display_name']}</h4>
                            <a onClick={() => setIsMinerModalOpen(true)}>Edit</a>
                            &nbsp;|&nbsp;
                            <a onClick={handleRunMiner}>Run</a>
                            &nbsp;|&nbsp;
                            <a onClick={() => handleResetMiner(false)}>Reset</a>
                            &nbsp;|&nbsp;
                            <a className='link-danger' onClick={handleDeleteMiner}>Delete</a>
                        </div>
                        <Container fluid>
                            <div className='text-dark p-3'>
                                <PreviewDetails datapoint={Object.fromEntries(Object.entries(miner).filter(([key]) => ![
                                    '_id', 'organization_id', 'user_id', 'display_name'
                                ].includes(key)).map(([key, value]) => {
                                    if (key === 'status') {

                                        return [key, value === 'pending' ? (
                                            <div>
                                                {value} <a className='text-decoration-underline cursor-pointer' onClick={() => setLastRequestedRefresh(Date.now())}>(refresh)</a>
                                            </div>
                                        ) : value === 'error' ? (
                                            <div>
                                                {value} <a className='text-decoration-underline cursor-pointer' onClick={handleRunMiner}>(re-run)</a>
                                            </div>
                                        ) : value];
                                    } else return [key, value];
                                }))}/>
                                <hr/>
                                <h4>Results</h4>
                                <div className='my-3'>
                                    <Async
                                        fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`)}
                                        refetchOnChanged={[minerId, lastRequestedRefresh]}
                                        renderData={({task}) => task ? (
                                            <>
                                                {task['result'] ? (
                                                    <a onClick={async () => {
                                                        const datapoints = await baseJSONClient(`/api/tasks/miners/results/${minerId}?as_csv=true`);

                                                        saveAs(new Blob([datapoints], {type: 'text/csv;charset=utf-8'}), `${slugify(miner['display_name'])}.csv`);
                                                    }}>Download as CSV</a>
                                                ) : null}
                                                <PreviewDetails datapoint={task}/>
                                                {
                                                    task['status'] === 'SUCCESS' ? (
                                                        <>
                                                            <hr />
                                                            <div className='my-3'>
                                                                <DatapointsViewer filters={[{left: 'id', op: 'in', right: task['result']}]} renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                                                                    <DatasetSelector allowNew title='Add selected to dataset' onChange={async (datasetId) => {
                                                                        await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                                                                        history.push(`/dataset/${datasetId}`);
                                                                    }}>
                                                                        Add selected to dataset
                                                                    </DatasetSelector>
                                                                ) : null} />
                                                            </div>
                                                        </>
                                                    ) : null
                                                }
                                            </>
                                        ) : <span>Miner not Run</span>
                                        }
                                    />
                                </div>
                            </div>
                        </Container>
                    </>
                )}
            />
        </Menu>
    );
};


export default Miner;
