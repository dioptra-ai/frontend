import {Col, Container, Row, Tab, Tabs} from 'react-bootstrap';
import {Link, Redirect, Route, Switch} from 'react-router-dom';

import AwsS3Integration from './aws-s3';
import GoogleCloudStorageIntegration from './google-cloud-storage';
import Table from 'react-bootstrap/Table';

import Async from 'components/async';
import baseJSONClient from 'clients/base-json-client';
import {RenderDatapoint} from 'components/preview-details';

const Settings = () => {

    return (
        <Container className='text-dark p-4' fluid>
            <p className='bold-text fs-3'>Settings</p>
            <Switch>
                <Route path='/settings' exact render={() => <Redirect to='/settings/integrations'/>} />
                <Route render={({location, history}) => (
                    <Tabs className='mt-4'
                        activeKey={`/settings/${location.pathname.split('/')[2]}`}
                        defaultActiveKey='/settings/integrations'
                        onSelect={(key) => {
                            history.push(key);
                        }}
                    >
                        <Tab eventKey='/settings/integrations' title='Cloud Integrations'>
                            <Row className='g-4'>
                                <Col className='p-3'>
                                    <AwsS3Integration />
                                </Col>
                                <Col className='p-3'>
                                    <GoogleCloudStorageIntegration />
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey='/settings/uploads' title='Uploads'>
                            <Row>
                                <Col className='p-3'>
                                    <Switch>
                                        <Route path='/settings/uploads' exact>
                                            <Async
                                                key='/settings/uploads'
                                                fetchData={() => baseJSONClient('/api/ingestion/executions')}
                                                renderData={(executions) => (
                                                    <>
                                                        <h4>Recent Uploads</h4>
                                                        <Table striped bordered hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Start Time</th>
                                                                    <th>End Time</th>
                                                                    <th>Duration</th>
                                                                    <th>Status</th>
                                                                    <th>Details</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {executions?.map((execution) => {
                                                                    return (
                                                                        <tr key={execution.id}>
                                                                            <td>{new Date(execution.startDate).toLocaleString()}</td>
                                                                            <td>{new Date(execution.stopDate).toLocaleString()}</td>
                                                                            <td>{
                                                                                (execution.startDate && execution.stopDate) ?
                                                                                    Number((new Date(execution.stopDate) - new Date(execution.startDate)) / 1000).toLocaleString() : '-'} seconds</td>
                                                                            <td>{execution.status}</td>
                                                                            <td>
                                                                                <Link to={`/settings/uploads/${execution.id}`}>
                                                                                View
                                                                                </Link>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </Table>
                                                    </>
                                                )}
                                            />
                                        </Route>
                                        <Route path='/settings/uploads/:id'>
                                            {({match}) => (
                                                <Async
                                                    key={match.params.id}
                                                    fetchData={() => baseJSONClient(`/api/ingestion/executions/${match.params.id}`)}
                                                    renderData={(execution) => (
                                                        <>
                                                            <h4>Upload Details</h4>
                                                            <RenderDatapoint datapoint={execution} />
                                                        </>
                                                    )}
                                                />
                                            )}
                                        </Route>
                                    </Switch>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                )} />
            </Switch>
        </Container>
    );
};

export default Settings;
