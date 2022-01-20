import baseJSONClient from 'clients/base-json-client';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Incidents from '../../../components/incidents';
import {setupComponent} from '../../../helpers/component-helper';
import Alerts from './../../../components/alerts';

const IncidentsAndAlerts = () => {
    const [alerts, setAlerts] = React.useState([]);
    const [incidents, setIncidents] = React.useState([]);

    React.useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        baseJSONClient('/api/alerts/events/list').then((response) => {
            if (response.status === 200) {
                setIncidents(response.alert_events);
            }
        });
        baseJSONClient('/api/alerts/list').then((response) => {
            if (response.status === 200) {
                setAlerts(response.alerts);
            }
        });
    };

    return (
        <Row className='my-3'>
            <Col lg={6}>
                <Incidents incidents={incidents} refreshCallback={refresh} />
            </Col>
            <Col lg={6}>
                <Alerts alerts={alerts} refreshCallback={refresh} />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
