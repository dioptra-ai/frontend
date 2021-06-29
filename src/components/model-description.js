import {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';

const ModelDescription = ({title = '', description = '', owner = '', version = '', tier = '', deployed = ''}) => {
    const [expand, setExpand] = useState(false);

    return (
        <Container className='bg-light' fluid >
            <Row className='model-title py-4'>
                <Col>
                    <span className='text-dark fs-2 fw-bold'>{title}</span>
                    <button className='btn-expand bg-transparent' onClick={() => setExpand(!expand)}>
                        <FontIcon
                            className='text-dark'
                            icon={expand ? 'Arrow-Up' : 'Arrow-Down'}
                            size={13}
                        />
                    </button>
                </Col>
                <Col lg={3}>
                    <div className='btn-incidents text-dark fw-bold fs-5 p-3'>
                        Open Incidents
                        <FontIcon
                            className='text-warning mx-2'
                            icon='Warning'
                            size={40}
                        />
                        <span className='text-warning'>5</span>
                    </div>
                </Col>
            </Row>
            {expand && <div className='title-border'/>}
            {expand && <Row className='text-dark py-4'>
                <Col className='details-col' lg={4}>
                    <p className='fw-bold'>Description</p>
                    <p className='description'>{description}</p>
                </Col>
                <Col className='details-col' lg={2}>
                    <p className='fw-bold'>Owner</p>
                    <p>{owner}</p>
                </Col>
                <Col className='details-col' lg={2}>
                    <p className='fw-bold'>Version</p>
                    <p>{version}</p>
                </Col>
                <Col className='details-col' lg={2}>
                    <p className='fw-bold'>Tier of the model</p>
                    <p>{tier}</p>
                </Col>
                <Col className='details-col' lg={2}>
                    <p className='fw-bold'>Last Deployed</p>
                    <p>{deployed}</p>
                </Col>
            </Row>}
        </Container>
    );
};

ModelDescription.propTypes = {
    deployed: PropTypes.string,
    description: PropTypes.string,
    owner: PropTypes.string,
    tier: PropTypes.string,
    title: PropTypes.string,
    version: PropTypes.string
};

export default ModelDescription;
