import {useState} from 'react';
import {useHistory, useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import {saveAs} from 'file-saver';
import slugify from 'slugify';

import Select from 'components/select';
import MinerModal from 'components/miner-modal';
import {DatasetEditModal} from 'components/dataset-modal';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import Menu from 'components/menu';
import Async from 'components/async';
import PreviewDetails from 'components/preview-details';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import SamplesPreview from 'components/samples-preview';

const ANALYSES = {
    DATA_VIEWER: 'Data Viewer',
    CLUSTERING: 'Clustering',
    OUTLIER: 'Outlier Detection'
};

const Miner = () => {
    const history = useHistory();
    const {minerId} = useParams();
    const [isMinerModalOpen, setIsMinerModalOpen] = useState(false);
    const [lastRequestedRefresh, setLastRequestedRefresh] = useState(0);
    const analysesKeys = Object.keys(ANALYSES);
    const [selectedAnalysis, setSelectedAnalysis] = useState(analysesKeys[0]);
    const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
    const handleRunMiner = async () => {
        await baseJSONClient('/api/tasks/miner/run', {
            method: 'post',
            body: {miner_id: minerId}
        });
        setLastRequestedRefresh(Date.now());
    };
    const handleResetMiner = async () => {
        await baseJSONClient('/api/tasks/miner/reset', {
            method: 'post',
            body: {miner_id: minerId}
        });
        setLastRequestedRefresh(Date.now());
    };
    const handleDeleteMiner = async () => {

        if (window.confirm('Are you sure you want to delete this miner?')) {
            await baseJSONClient('/api/tasks/miners/delete', {
                method: 'post',
                body: {miner_id: minerId}
            });
            history.push('/miners');
        }
    };

    return (
        <Menu>
            <TopBar hideTimePicker/>
            <Async
                fetchData={() => baseJSONClient(`/api/tasks/miners/${minerId}`)}
                refetchOnChanged={[minerId, lastRequestedRefresh]}
                renderData={(miner) => (
                    <>
                        {isMinerModalOpen ? (
                            <MinerModal
                                isOpen
                                onMinerSaved={() => {
                                    setIsMinerModalOpen(false);
                                    handleResetMiner();
                                }}
                                onClose={() => setIsMinerModalOpen(false)}
                                defaultMiner={miner}
                            />
                        ) : null}
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{miner['display_name']}</h4>
                            <a href='#' onClick={() => setIsMinerModalOpen(true)}>Edit</a>
                            &nbsp;|&nbsp;
                            <a href='#' onClick={handleRunMiner}>Run</a>
                            &nbsp;|&nbsp;
                            <a href='#' onClick={handleResetMiner}>Reset</a>
                            &nbsp;|&nbsp;
                            <a href='#' style={{color: 'red'}} onClick={handleDeleteMiner}>Delete</a>
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
                                        fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`, {memoized: false})}
                                        refetchOnChanged={[minerId, lastRequestedRefresh]}
                                        renderData={({task}) => task ? (
                                            <>
                                                {task['result'] ? (
                                                    <>
                                                        <a onClick={() => setIsDatasetModalOpen(true)}>Export to Dataset</a>
                                                    &nbsp;|&nbsp;
                                                        <a onClick={async () => {
                                                            const datapoints = await baseJSONClient(`/api/tasks/miners/results/${minerId}?as_csv=true`);

                                                            saveAs(new Blob([datapoints], {type: 'text/csv;charset=utf-8'}), `${slugify(miner['display_name'])}.csv`);
                                                        }}>Download as CSV</a>
                                                    </>) : null}
                                                <PreviewDetails datapoint={task}/>
                                                {
                                                    task['status'] === 'SUCCESS' ? (
                                                        <>
                                                            <hr/>
                                                            <Select required defaultValue={selectedAnalysis} onChange={setSelectedAnalysis}>
                                                                {
                                                                    analysesKeys.map((k) => (
                                                                        <option value={k} key={k}>{ANALYSES[k]}</option>
                                                                    ))
                                                                }
                                                            </Select>
                                                            <div className='my-3'>
                                                                {
                                                                    task['result'].length ? (
                                                                        selectedAnalysis === 'OUTLIER' ? (
                                                                            <OutliersOrDrift
                                                                                filters={[{
                                                                                    left: 'uuid',
                                                                                    op: 'in',
                                                                                    right: task['result']
                                                                                }]}
                                                                                embeddingsField={miner['embeddings_field']}
                                                                            />
                                                                        ) :
                                                                            selectedAnalysis === 'CLUSTERING' ? (
                                                                                <ClustersAnalysis
                                                                                    filters={[{
                                                                                        left: 'uuid',
                                                                                        op: 'in',
                                                                                        right: task['result']
                                                                                    }]}
                                                                                    embeddingsField={miner['embeddings_field']}
                                                                                />
                                                                            ) : (
                                                                                <div className='my-3'>
                                                                                    <Async
                                                                                        fetchData={() => metricsClient('select', {
                                                                                            select: '"uuid", "request_id",  "image_metadata", "prediction", "groundtruth", "text", "tags"',
                                                                                            filters: [{
                                                                                                left: 'uuid',
                                                                                                op: 'in',
                                                                                                right: task['result']
                                                                                            }]
                                                                                        })}
                                                                                        renderData={(datapoints) => <SamplesPreview samples={datapoints}/>}
                                                                                    />
                                                                                </div>
                                                                            )
                                                                    ) : (
                                                                        <h5>Empty Result</h5>
                                                                    )
                                                                }
                                                            </div>
                                                        </>
                                                    ) : null
                                                }
                                                {isDatasetModalOpen ? (
                                                    <DatasetEditModal
                                                        isOpen
                                                        onDatasetSaved={(dataset) => {
                                                            setIsDatasetModalOpen(false);
                                                            history.push(`/dataset/${dataset['uuid']}`);
                                                        }}
                                                        onClose={() => setIsDatasetModalOpen(false)}
                                                    />
                                                ) : null}
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
