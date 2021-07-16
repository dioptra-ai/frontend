import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';
import {Link, useParams} from 'react-router-dom';
import {Paths} from '../configs/route-config';
import {IconNames} from '../constants';

const ModelDescription = ({name, description, team, version, tier, lastDeployed, incidents}) => {
    const [expand, setExpand] = useState(false);
    const {_id} = useParams();

    return (
        <Container className='bg-white-blue' fluid >
            <Row className='align-items-center mb-4 px-3'>
                <Col className='d-flex align-items-center'>
                    <h1 className='text-dark fs-1 fw-bold m-0'>{name}</h1>
                    <button className='btn-expand bg-transparent' onClick={() => setExpand(!expand)}>
                        <FontIcon
                            className='text-dark'
                            icon={expand ? IconNames.ARROW_UP : IconNames.ARROW_DOWN}
                            size={9}
                        />
                    </button>
                </Col>
                <Col className='d-flex justify-content-end' lg={3}>
                    <Link className='btn-incidents text-decoration-none text-dark fw-bold fs-5 p-3' to={Paths(_id).MODEL_INCIDENTS_AND_ALERTS}>
                        Open Incidents
                        <FontIcon
                            className={`${incidents ? 'text-warning' : 'text-success'} mx-2`}
                            icon={IconNames.WARNING}
                            size={40}
                        />
                        <span className='text-warning'>{incidents !== 0 && incidents}</span>
                    </Link>
                </Col>
            </Row>
            <div className={`model-details ${expand ? 'show' : ''} text-dark mx-3`}>
                <Row className='mt-3 py-3'>
                    <Col className='details-col' lg={4}>
                        <p className='fw-bold fs-5'>Description</p>
                        <p className='description'>{description}</p>
                    </Col>
                    <Col className='details-col' lg={2}>
                        <p className='fw-bold'>Owner</p>
                        <p>{team?.name || <>&nbsp;</>}</p>
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
                        <p>{lastDeployed}</p>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

ModelDescription.propTypes = {
    description: PropTypes.string,
    incidents: PropTypes.number,
    lastDeployed: PropTypes.string,
    name: PropTypes.string,
    team: PropTypes.object,
    tier: PropTypes.number,
    version: PropTypes.string
};

export default ModelDescription;
