import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';
import {Link, useParams} from 'react-router-dom';
import {Paths} from '../configs/route-config';
import {IconNames} from '../constants';
import {formatDateTime} from 'helpers/date-helper';

const ModelDescription = ({name, description, team, version, tier, lastDeployed, incidents}) => {
    const [expand, setExpand] = useState(false);
    const {_id} = useParams();

    return (
        <Container className='bg-white-blue model-desc' fluid >
            <Row className='align-items-center mb-4 px-3'>
                <Col className='d-flex align-items-center'>
                    <h1 className='text-dark fs-1 m-0 bold-text'>{name}</h1>
                    <button className='btn-expand bg-transparent' onClick={() => setExpand(!expand)}>
                        <FontIcon
                            className='text-dark'
                            icon={expand ? IconNames.ARROW_UP : IconNames.ARROW_DOWN}
                            size={9}
                        />
                    </button>
                </Col>
                <Col className='d-flex justify-content-end' lg={3}>
                    <Link className='btn-incidents text-decoration-none text-dark bold-text fs-4 p-3' to={Paths(_id).MODEL_INCIDENTS_AND_ALERTS}>
                        Open Incidents
                        <FontIcon
                            className={`${incidents ? 'text-warning' : 'text-success'} mx-2`}
                            icon={incidents ? IconNames.WARNING : IconNames.CHECK}
                            size={40}
                        />
                        <span className='text-warning'>{incidents !== 0 && incidents}</span>
                    </Link>
                </Col>
            </Row>
            <div className={`model-details ${expand ? 'show' : ''} text-dark mx-3`}>
                <Row className='mt-3 py-3'>
                    <Col className='details-col' lg={4}>
                        <p className='bold-text fs-4'>Description</p>
                        <p className='description fs-6'>{description}</p>
                    </Col>
                    <Col className='details-col p-3 justify-content-start' lg={2}>
                        <p className='bold-text fs-5'>Owner</p>
                        <p className='fs-6'>{team?.name || <>&nbsp;</>}</p>
                    </Col>
                    <Col className='details-col p-3 justify-content-start' lg={2}>
                        <p className='bold-text fs-5'>Version</p>
                        <p className='fs-6'>{version}</p>
                    </Col>
                    <Col className='details-col p-3 justify-content-start' lg={2}>
                        <p className='bold-text fs-5'>Tier of the model</p>
                        <p className='fs-6'>{tier}</p>
                    </Col>
                    <Col className='details-col p-3 justify-content-start' lg={2}>
                        <p className='bold-text fs-5'>Last Deployed</p>
                        <p className='fs-6'>{formatDateTime(lastDeployed)}</p>
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
