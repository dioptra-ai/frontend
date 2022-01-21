import baseJSONClient from 'clients/base-json-client';
import Alerts from 'components/alerts';
import Incidents from 'components/incidents';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {setupComponent} from 'helpers/component-helper';

const IncidentsAndAlerts = () => {
    const [alerts, setAlerts] = React.useState([]);
    const [incidents, setIncidents] = React.useState([]);

    const refresh = (alerts = true, incidents = true) => {
        if (alerts) {
            baseJSONClient('/api/tasks/alerts/list').then((response) => {
                setAlerts(response.alerts);
            });
        }
        if (incidents) {
            baseJSONClient('/api/tasks/alerts/events/list').then((response) => {
                setIncidents(response.alert_events);
            });
        }
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
