import {useState} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import AppContext from 'context/app-context';
import Menu from 'components/menu';
import Async from 'components/async';
import PreviewDetails from 'components/preview-details';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';

const ANALYSES = {
    CLUSTERING: 'Clustering',
    OUTLIER: 'Outlier Detection'
};

const Miner = () => {
    const {minerId} = useParams();
    const analysesKeys = Object.keys(ANALYSES);
    const [selectedAnalysis, setSelectedAnalysis] = useState(analysesKeys[0]);

    return (
        <Menu>
            <TopBar hideTimePicker/>
            <Async
                fetchData={() => metricsClient(`miners/${minerId}`)}
                renderData={(miner) => (
                    <>
                        <div className='bg-white-blue text-dark p-3'>
                            <h4>{miner['display_name']}</h4>
                        </div>
                        <Container fluid>
                            <div className='text-dark p-3'>
                                <PreviewDetails sample={Object.fromEntries(Object.entries(miner).filter(([key]) => ![
                                    '_id', 'organization_id', 'mined_uuids', 'user_id', 'task_id', 'display_name'
                                ].includes(key)))}/>
                                <div className='my-3'>
                                    <Async
                                        fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`, {memoized: false})}
                                        refetchOnChanged={[minerId]}
                                        renderData={(task) => (
                                            <>
                                                <table>
                                                    <tr>
                                                        <td>
                                                            <p>Execution Status: {task.status}</p>
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
                                                </table>
                                            </>
                                        )}
                                    />
                                </div>
                                {
                                    miner['mined_uuids'] && miner['mined_uuids'].length ? (
                                        <AppContext.Provider value={{
                                            getAllSqlFiltersFromAppContext: () => `"uuid" IN (${miner['mined_uuids'].map((u) => `'${u}'`).join(',')})`
                                        }}>

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
                                                            selectedAnalysis === 'CLUSTERING' ? <ClustersAnalysis /> : null
                                                }
                                            </div>
                                        </AppContext.Provider>
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
