import baseJSONClient from 'clients/base-json-client';
import Alerts from 'components/alerts';
import Incidents from 'components/incidents';
import {setupComponent} from 'helpers/component-helper';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import useModel from 'customHooks/use-model';

const IncidentsAndAlerts = () => {
    const model = useModel();

    const [alerts, setAlerts] = React.useState([]);
    const [alertsLoading, setAlertsLoading] = React.useState(false);
    const [incidents, setIncidents] = React.useState([]);
    const [incidentsLoading, setIncidentsLoading] = React.useState(false);

    const fetchAlerts = (page = 1) => {
        setAlertsLoading(true);
        baseJSONClient(
            `/api/tasks/alerts?page=${page}&model_type=${model.mlModelType}&per_page=4`
        ).then((response) => {
            setAlerts(response.alerts);
            setAlertsLoading(false);
        });
    };

    const fetchIncidents = (page = 1) => {
        setIncidentsLoading(true);
        baseJSONClient(
            `/api/tasks/alert/events?page=${page}&model_type=${model.mlModelType}&per_page=6`
        ).then((response) => {
            setIncidents(response.alert_events);
            setIncidentsLoading(false);
        });
    };

    return (
        <Row className='my-3'>
            <Col lg={6}>
                <Incidents
                    incidents={incidents}
                    refreshCallback={fetchIncidents}
                    loading={incidentsLoading}
                />
            </Col>
            <Col lg={6}>
                <Alerts
                    alerts={alerts}
                    refreshCallback={fetchAlerts}
                    onDeleteRefreshCallback={() => {
                        fetchIncidents();
                        fetchAlerts();
                    }}
                    loading={alertsLoading}
                />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
