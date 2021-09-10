import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import FontIcon from './font-icon';
import {Link} from 'react-router-dom';
import {Paths} from '../configs/route-config';
import {IconNames} from 'constants';
import {formatDateTime} from 'helpers/date-helper';
import {Button} from 'react-bootstrap';
import ModalComponent from 'components/modal';
import ModelForm from 'pages/templates/model-form';
import {setupComponent} from 'helpers/component-helper';
import timeSeriesClient from 'clients/timeseries';
import Select from './select';


const ModelDescription = ({_id, filtersStore, modelStore, name, description, team, tier, lastDeployed, incidents, mlModelId, mlModelType, referencePeriod}) => {
    const [expand, setExpand] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [errors, setErrors] = useState({});
    const mlModelVersion = filtersStore.modelVersion;
    const [allMlModelVersions, setAllMlModelVersions] = useState([]);

    useEffect(() => {

        timeSeriesClient({
            query: `SELECT
            model_version as mlModelVersion
            FROM "dioptra-gt-combined-eventstream"
            WHERE model_id='${mlModelId}'
            GROUP BY model_version`
        })
            .then((data) => {
                setAllMlModelVersions([
                    ...data.map((v) => ({name: v.mlModelVersion, value: v.mlModelVersion}))
                ]);
            })
            .catch(() => setAllMlModelVersions([]));
    }, [mlModelId]);

    const handleSubmit = (data) => {
        if (errors) {
            setErrors({});
        }

        fetch(`/api/ml-model/${_id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((modelData) => {
                if (modelData.hasOwnProperty('err')) {
                    throw new Error(JSON.stringify(modelData));
                }
                modelStore.setModelById(_id, modelData);
                setShowModal(false);
            })
            .catch((e) => {
                const errObj = JSON.parse(e.message);

                setErrors(errObj.err);
            });
    };

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
                <Col className='d-flex justify-content-end' lg={5}>
                    <Link className='btn-incidents text-decoration-none text-dark bold-text fs-4 p-3' to={Paths({modelId: _id}).MODEL_INCIDENTS_AND_ALERTS}>
                        Open Incidents
                        <FontIcon
                            className={`${incidents ? 'text-warning' : 'text-success'} mx-2`}
                            icon={incidents ? IconNames.WARNING : IconNames.CHECK}
                            size={40}
                        />
                        <span className='text-warning'>{incidents !== 0 && incidents}</span>
                    </Link>
                    <Button
                        className='py-3 fs-6 bold-text px-5 text-white ms-3'
                        onClick={() => setShowModal(true)}
                        variant='primary'
                    >
                EDIT MODEL
                    </Button>
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
                        {
                            mlModelVersion ?
                                allMlModelVersions.length ?
                                    <Select
                                        initialValue={mlModelVersion}
                                        onChange={(v) => {
                                            filtersStore.modelVersion = v;
                                        }}
                                        options={allMlModelVersions}
                                    /> :
                                    <p className='fs-6'>{mlModelVersion}</p> :
                                <p className='fs-6'>NA</p>
                        }
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
            <ModalComponent isOpen={showModal} onClose={() => setShowModal(false)}>
                <ModelForm
                    errors={errors}
                    initialValue={{name, description, mlModelId, mlModelType, referencePeriod}}
                    onSubmit={handleSubmit}
                />
            </ModalComponent>
        </Container>
    );
};

ModelDescription.propTypes = {
    description: PropTypes.string,
    filtersStore: PropTypes.object,
    incidents: PropTypes.number,
    lastDeployed: PropTypes.string,
    modelStore: PropTypes.object,
    name: PropTypes.string,
    team: PropTypes.object,
    tier: PropTypes.number,
    _id: PropTypes.string.isRequired,
    mlModelId: PropTypes.string.isRequired,
    mlModelType: PropTypes.string.isRequired,
    referencePeriod: PropTypes.object.isRequired
};

export default setupComponent(ModelDescription);
