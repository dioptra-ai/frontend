import {useState} from 'react';
import {useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import Select from 'components/select';
import OutliersOrDrift from 'pages/common/outliers-or-drift';
import ClustersAnalysis from 'pages/common/clusters-analysis';
import AppContext from 'context/app-context';
import Menu from 'components/menu';
import Async from 'components/async';
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
            <TopBar showTimePicker/>
            <div className='bg-white-blue text-dark p-3'>
                <Async
                    fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`, {memoized: false})}
                    refetchOnChanged={[minerId]}
                    renderData={(task) => (
                        <>
                            <h4>Status: {task.status}</h4>
                            <table>
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
            <Container fluid>
                <div className='text-dark p-3'>
                    <Async
                        fetchData={() => metricsClient(`miners/${minerId}`, null, 'get')}
                        renderData={(miner) => miner['mined_uuids'] ? (
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
                            <h4>No Data</h4>
                        )}
                    />
                </div>
            </Container>
        </Menu>
    );
};


export default Miner;
