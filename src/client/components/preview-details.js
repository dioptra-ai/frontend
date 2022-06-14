import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

const PreviewDetails = ({sample}) => {

    if (Array.isArray(sample)) {

        return (
            <Row className='g-1'>
                {sample.map((v, i) => <Col key={i} xs={12} className={i % 2 ? 'bg-white-blue' : ''}><PreviewDetails sample={v}/></Col>)}
            </Row>
        );
    } else if (sample && typeof sample === 'object') {

        return (
            <Container fluid>
                {
                    Object.entries(sample).map(([k, v], i) => (
                        <Row key={k} className={i % 2 ? 'bg-white-blue' : ''}>
                            <Col xs={3}>{k}</Col>
                            <Col className='text-break'>
                                <PreviewDetails sample={v}/>
                            </Col>
                        </Row>
                    ))
                }
            </Container>
        );
    } else return String(sample);
};

PreviewDetails.propTypes = {
    sample: PropTypes.object.isRequired
};

export default PreviewDetails;
