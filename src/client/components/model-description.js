import {Textfit} from 'react-textfit';
import {useContext, useState} from 'react';
import {Button, Form} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import {formatDateTime} from 'helpers/date-helper';
import Modal from 'components/modal';
import EditModel from 'pages/model/edit-model';
import {setupComponent} from 'helpers/component-helper';
import {BsChevronDown, BsChevronUp} from 'react-icons/bs';
import {AiOutlineEdit} from 'react-icons/ai';
import {MdOutlineCompare, MdOutlineDelete} from 'react-icons/md';
import Select from 'components/select';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import comparisonContext from 'context/comparison-context';
import fetchWithRetry from '../clients/fetch-retry-client';

const ModelDescription = ({_id, name, description, team, tier, lastDeployed, mlModelId, mlModelType, referencePeriod, referenceBenchmarkId, modelStore, filtersStore}) => {
    const [expand, setExpand] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [errors, setErrors] = useState([]);
    const [addedModelId, setAddedModelId] = useState();
    const [addedModelVersion, setAddedModelVersion] = useState();
    const {index: comparisonIndex, total: comparisonTotal} = useContext(comparisonContext);
    const allModels = modelStore.models;

    const handleSubmit = (data) => {
        if (errors) {
            setErrors([]);
        }

        fetchWithRetry(`/api/ml-model/${_id}`, {
            retries: 15,
            retryDelay: 3000,
            retryOn: [503, 504],
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((modelData) => {
                if (modelData.error) {

                    throw new Error(modelData.error);
                }
                modelStore.setModelById(_id, modelData);
                setShowEditModal(false);
            })
            .catch((e) => {

                setErrors([e.message]);
            });
    };

    return (
        <Container className='bg-white-blue model-desc' fluid >
            <Row className='align-items-center py-2 px-3'>
                <Col className='d-flex align-items-center' xs={11}>
                    <div style={{fontSize: 24}}>
                        <Textfit mode='multi' min={2} max={24} forceSingleModeWidth={false}>
                            <span>{name}</span>
                        </Textfit>
                    </div>
                    <button className='btn-expand bg-transparent text-dark' onClick={() => setExpand(!expand)}>
                        {expand ? (
                            <BsChevronUp className='fs-2'/>
                        ) : (
                            <BsChevronDown className='fs-2'/>
                        )}
                    </button>
                    <button
                        className='btn-expand bg-transparent text-dark'
                        onClick={() => setShowEditModal(true)}
                    >
                        <AiOutlineEdit className='fs-2'/>
                    </button>
                </Col>
                <Col xs={1}>
                    <div className='d-flex align-items-center justify-content-end'>
                        {
                            comparisonIndex === comparisonTotal - 1 ? (
                                <button
                                    className='btn-expand bg-transparent text-dark'
                                    onClick={() => setShowCompareModal(true)}
                                >
                                    <MdOutlineCompare className='fs-2'/>
                                </button>
                            ) : null
                        }
                        {
                            comparisonIndex !== 0 ? (
                                <button
                                    className='btn-expand bg-transparent text-dark'
                                    onClick={() => {

                                        filtersStore.models = filtersStore.models.filter((_, i) => i !== comparisonIndex);
                                    }}
                                >
                                    <MdOutlineDelete className='fs-2'/>
                                </button>
                            ) : null
                        }
                    </div>
                </Col>
            </Row>
            <div className={`model-details ${expand ? 'show' : ''} text-dark mx-3`}>
                <Row className='mt-3 py-3'>
                    <Col className='details-col' lg={6}>
                        <p className='bold-text fs-4'>Description</p>
                        <p className='description fs-6'>{description}</p>
                    </Col>
                    <Col className='details-col p-3 justify-content-start' lg={2}>
                        <p className='bold-text fs-5'>Owner</p>
                        <p className='fs-6'>{team?.name || <>&nbsp;</>}</p>
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
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title='Edit Model'>
                <EditModel
                    errors={errors}
                    initialValue={{name, description, mlModelId, mlModelType, referencePeriod, referenceBenchmarkId}}
                    onSubmit={handleSubmit}
                />
            </Modal>
            <Modal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} title='Compare Model'>
                <Form style={{width: 500}} onSubmit={(e) => {
                    e.preventDefault();

                    filtersStore.models = filtersStore.models.concat([{
                        _id: addedModelId,
                        mlModelId: modelStore.getModelById(addedModelId)?.mlModelId,
                        mlModelVersion: addedModelVersion
                    }]);

                    setShowCompareModal(false);
                }}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Model</Form.Label>
                        <Select
                            onChange={setAddedModelId}
                            options={[{name: 'Choose Model'}].concat(allModels.map((m) => ({
                                name: m.name,
                                value: m._id
                            })))}
                        />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Model Version</Form.Label>
                        <Async
                            refetchOnChanged={[addedModelId]}
                            fetchData={() => metricsClient('queries/all-ml-model-versions', {
                                ml_model_id: modelStore.getModelById(addedModelId)?.mlModelId
                            })}
                            renderData={(data) => (
                                <Select
                                    onChange={setAddedModelVersion}
                                    options={data.map((d) => ({
                                        name: d.mlModelVersion,
                                        value: d.mlModelVersion
                                    }))}
                                />
                            )}
                        />
                    </Form.Group>
                    <Row>
                        <Col>
                            <Button
                                className='w-100 text-white btn-submit mt-3 py-2'
                                variant='primary' type='submit'
                            >
                                Compare Models
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Container>
    );
};

ModelDescription.propTypes = {
    description: PropTypes.string,
    lastDeployed: PropTypes.string,
    modelStore: PropTypes.object,
    name: PropTypes.string,
    team: PropTypes.object,
    tier: PropTypes.number,
    _id: PropTypes.string.isRequired,
    mlModelId: PropTypes.string.isRequired,
    mlModelType: PropTypes.string.isRequired,
    referencePeriod: PropTypes.object,
    referenceBenchmarkId: PropTypes.string,
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(ModelDescription);
