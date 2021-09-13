import Alerts from './../../../components/alerts';
import Incidents from '../../../components/incidents';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {setupComponent} from '../../../helpers/component-helper';

const IncidentsAndAlerts = () => {
    return (
        <div style={{position: 'relative'}}>
            <Row>
                <Col lg={6}>
                    <Incidents />
                </Col>
                <Col lg={6}>
                    <Alerts />
                </Col>
            </Row>
            <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                color: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <h1>This Feature Will Be Available Soon</h1>
            </div>
        </div>
    );
};

export default setupComponent(IncidentsAndAlerts);
