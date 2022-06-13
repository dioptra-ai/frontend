import {useState} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import useModel from 'hooks/use-model';

import baseJSONClient from 'clients/base-json-client';
import Alerts from 'components/alerts';
import Incidents from 'components/incidents';
import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';

const IncidentsAndAlerts = () => {
    const model = useModel();
    const [alertsPage, setAlertsPage] = useState(0);
    const [incidentsPage, setIncidentsPage] = useState(0);
    const [lastAlertDeleteEvent, setLastAlertDeleteEvent] = useState(new Date());

    return (
        <Row className='my-3 g-2'>
            <Col lg={6}>
                <Async
                    fetchData={() => baseJSONClient(
                        `/api/tasks/alert/events?page=${incidentsPage}&model_type=${model.mlModelType}&per_page=10`
                    )}
                    refetchOnChanged={[incidentsPage, model.mlModelType, lastAlertDeleteEvent]}
                    renderData={(data) => (
                        <Incidents
                            incidents={data['alert_events']}
                            onPageChange={setIncidentsPage}
                        />
                    )}
                />
            </Col>
            <Col lg={6}>
                <Async
                    fetchData={() => baseJSONClient(
                        `/api/tasks/alerts?page=${alertsPage}&model_type=${model.mlModelType}&per_page=10`
                    )}
                    refetchOnChanged={[alertsPage, model.mlModelType, lastAlertDeleteEvent]}
                    renderData={(data) => (
                        <Alerts
                            alerts={data['alerts']}
                            onPageChange={setAlertsPage}
                            onDeleteRefreshCallback={setLastAlertDeleteEvent}
                        />
                    )}
                />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
