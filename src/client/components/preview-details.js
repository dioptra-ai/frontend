import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

const PreviewDetails = ({sample}) => (

    <Container fluid>
        {
            Object.entries(sample).map(([k, v]) => (
                <Row key={k}>
                    <Col xs={4}>{k}</Col>
                    <Col className='text-break'>{
                        v && typeof v === 'object' ? (
                            <PreviewDetails sample={v}/>
                        ) : String(v)
                    }</Col>
                </Row>
            ))
        }
    </Container>
);

PreviewDetails.propTypes = {
    sample: PropTypes.object.isRequired
};

export default PreviewDetails;
