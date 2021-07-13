import Alerts from './../../../components/alerts';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {setupComponent} from '../../../helpers/component-helper';

const IncidentsAndAlerts = () => {
    return (
        <Row>
            <Col lg={6}>
                <Alerts />
            </Col>
        </Row>
    );
};

export default setupComponent(IncidentsAndAlerts);
