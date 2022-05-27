import Container from 'react-bootstrap/Container';
import {useParams} from 'react-router-dom';

import Menu from 'components/menu';
import Async from 'components/async';
import TopBar from 'pages/common/top-bar';
import baseJSONClient from 'clients/base-json-client';

const Miner = () => {
    const {minerId} = useParams();

    return (
        <Menu>
            <TopBar showTimePicker/>
            <Container className='bg-white-blue text-dark py-2' fluid>
                <Async
                    fetchData={() => baseJSONClient(`/api/tasks/miners/inspect/${minerId}`, {memoized: false})}
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
            </Container>
        </Menu>
    );
};


export default Miner;
