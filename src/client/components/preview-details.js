import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

const PreviewDetails = ({sample}) => (

    <Container fluid>
        {
            Object.keys(sample).map((k) => (
                <Row key={k}>
                    <Col xs={4}>{k}</Col>
                    <Col className='text-break'>{
                        typeof sample[k] === 'object' ? (
                            <PreviewDetails sample={sample[k]}/>
                        ) : String(sample[k])
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
