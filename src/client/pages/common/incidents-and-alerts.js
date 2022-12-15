import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Alerts from 'components/alerts';
import Incidents from 'components/incidents';
import {setupComponent} from 'helpers/component-helper';

const IncidentsAndAlerts = () => {

    return (
        <Row className='my-3 g-2'>
            <Col lg={6}>
                <Incidents
                    incidents={[]}
                    onPageChange={() => {}}
                />
            </Col>
            <Col lg={6}>
                <Alerts
                    alerts={[]}
                    onPageChange={() => {}}
                    onDeleteRefreshCallback={() => {}}
                />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
