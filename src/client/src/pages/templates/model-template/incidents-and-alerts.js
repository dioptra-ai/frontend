import Alerts from './../../../components/alerts';
import Incidents from '../../../components/incidents';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {setupComponent} from '../../../helpers/component-helper';

const IncidentsAndAlerts = () => {
    return (
        <Row className='my-3'>
            <Col lg={6}>
                <Incidents />
            </Col>
            <Col lg={6}>
                <Alerts />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
