import {useState} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import Select from 'components/select';
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
    const {minerId} = useParams();
    const [lastRequestedRefresh, setLastRequestedRefresh] = useState(0);
    const analysesKeys = Object.keys(ANALYSES);
    const [selectedAnalysis, setSelectedAnalysis] = useState(analysesKeys[0]);

    return (
        <Menu>
            <TopBar hideTimePicker/>
            <Async
                fetchData={() => metricsClient(`miners/${minerId}`, null, false)}
                refetchOnChanged={[minerId, lastRequestedRefresh]}
                renderData={(miner) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{miner['display_name']}</h4>
                        </div>
                        <Container fluid>
                            <div className='text-dark p-3'>
                                <PreviewDetails sample={Object.fromEntries(Object.entries(miner).filter(([key]) => ![
                                    '_id', 'organization_id', 'mined_uuids', 'user_id', 'task_id', 'display_name'
                                ].includes(key)).map(([key, value]) => {
                                    if (key === 'status') {

                                        return [key, value === 'pending' ? (
                                            <div>
                                                {value} <a className='text-decoration-underline cursor-pointer' onClick={() => setLastRequestedRefresh(Date.now())}>(refresh)</a>
                                            </div>
                                        ) : value];
                                    } else return [key, value];
                                }))}/>
                                <div className='my-3'>
                                    <Async
                                        fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`, {memoized: false})}
                                        refetchOnChanged={[minerId, lastRequestedRefresh]}
                                        renderData={(task) => (
                                            <>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <p>Execution Errors: {task.status}</p>
                                                            </td>
                                                        </tr>
                                                        {
                                                            task.executions.map((e, i) => (
                                                                <tr key={i}>
                                                                    <td>
                                                                        <p>Started at: {new Date(e['time_started'] * 1000).toString()}</p>
                                                                        <p>Failed at: {new Date(e['time_failed'] * 1000).toString()}</p>
                                                                        <hr/>
                                                                        <pre style={{whiteSpace: 'pre-wrap'}}>
                                                                            {e.traceback}
                                                                        </pre>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </>
                                        )}
                                    />
                                </div>
                                {
                                    miner['mined_uuids'] && miner['mined_uuids'].length ? (
                                        <>
                                            <Select required defaultValue={selectedAnalysis} onChange={setSelectedAnalysis}>
                                                {
                                                    analysesKeys.map((k) => (
                                                        <option value={k} key={k}>{ANALYSES[k]}</option>
                                                    ))
                                                }
                                            </Select>
                                            <div className='my-3'>
                                                {
                                                    selectedAnalysis === 'DRIFT' ? <OutliersOrDrift isDrift/> :
                                                        selectedAnalysis === 'OUTLIER' ? <OutliersOrDrift/> :
                                                            selectedAnalysis === 'CLUSTERING' ? (
                                                                <ClustersAnalysis
                                                                    filters={[{
                                                                        left: 'uuid',
                                                                        op: 'in',
                                                                        right: miner['mined_uuids']
                                                                    }]}
                                                                    embeddingsField={miner['embeddings_field']}
                                                                />
                                                            ) : (
                                                                <div className='my-3'>
                                                                    <Async
                                                                        fetchData={() => metricsClient('select', {
                                                                            select: `"uuid", 
                                                                                "groundtruth",
                                                                                "prediction",
                                                                                "image_metadata.uri",
                                                                                "image_metadata.width",
                                                                                "image_metadata.height",
                                                                                "image_metadata.object.width",
                                                                                "image_metadata.object.height",
                                                                                "image_metadata.object.left",
                                                                                "image_metadata.object.top",
                                                                                "prediction.width",
                                                                                "prediction.height",
                                                                                "prediction.left",
                                                                                "prediction.top",
                                                                                "prediction.class_name",
                                                                                "groundtruth.width",
                                                                                "groundtruth.height",
                                                                                "groundtruth.left",
                                                                                "groundtruth.top",
                                                                                "groundtruth.class_name",
                                                                                "text"`,
                                                                            where: `"uuid" IN (${miner['mined_uuids'].map((u) => `'${u}'`).join(',')})`
                                                                        })}
                                                                        renderData={(datapoints) => <SamplesPreview samples={datapoints}/>}
                                                                    />
                                                                </div>
                                                            )
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        <h3>No Mined Data</h3>
                                    )
                                }
                            </div>
                        </Container>
                    </>
                )}
            />
        </Menu>
    );
};


export default Miner;
