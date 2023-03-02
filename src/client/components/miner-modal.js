/* eslint-disable complexity */
import PropTypes from 'prop-types';

import Async from 'components/async';
import Modal from 'components/modal';
import Select from 'components/select';
import {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import {setupComponent} from 'helpers/component-helper';
import baseJSONClient from 'clients/base-json-client';
import {Container} from 'react-bootstrap';
import DatasetSelector from 'pages/dataset/dataset-selector';

const MinerModal = ({isOpen, onClose, onMinerSaved, defaultMiner = {}}) => {
    const {
        display_name, dataset_id, reference_dataset_id, size, metric, embeddings_field, strategy
    } = defaultMiner;
    const [minerName, setMinerName] = useState(display_name);
    const [minerMetric, setMinerMetric] = useState(metric || 'euclidean');
    const [minerAnalysisSpace, setMinerAnalysisSpace] = useState(embeddings_field);
    const [minerSize, setMinerSize] = useState(size);
    const [minerDatasetId, setMinerDatasetId] = useState(dataset_id);
    const [minerReferenceDatasetId, setMinerReferenceDatasetId] = useState(reference_dataset_id);
    const minerStrategyOptions = [{
        value: 'NEAREST_NEIGHBORS',
        name: 'N Nearest Neighbors'
    }, {
        value: 'CORESET',
        name: 'Coreset'
    }, {
        value: 'ENTROPY',
        name: 'N Highest Entropy'
    }, {
        value: 'ACTIVATION',
        name: 'N Lowest Activation'
    }];
    const [minerStrategy, setMinerStrategy] = useState(strategy || minerStrategyOptions[0].value);
    const saveMiner = async () => {
        const payload = {
            _id: defaultMiner?._id,
            display_name: minerName,
            strategy: minerStrategy,
            metric: minerMetric,
            size: minerSize,
            embeddings_field: minerAnalysisSpace,
            dataset_id: minerDatasetId,
            reference_dataset_id: minerReferenceDatasetId
        };

        if (!payload['_id'] || window.confirm('Changing the miner configuration will delete the current results. Do you really want to continue?')) {
            const miner = await baseJSONClient('/api/tasks/miners', {
                method: 'post',
                body: payload
            });

            if (onMinerSaved) {

                onMinerSaved(miner['miner_id']);
            }
        }
    };

    useEffect(() => {
        switch (minerStrategy) {
        case 'NEAREST_NEIGHBORS':
        case 'CORESET':
        case 'ACTIVATION':
            if (!minerAnalysisSpace) {
                setMinerAnalysisSpace('embeddings');
            }
            break;
        case 'ENTROPY':
            setMinerAnalysisSpace(null);
            break;
        default:
            break;
        }
    }, [minerStrategy]);


    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose()}
            title='Edit Miner'
        >
            <Form style={{minWidth: 900}} onSubmit={(e) => {
                e.preventDefault();
                saveMiner();
            }}>
                <Container fluid>
                    <Row className='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Miner Name</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control
                                    required
                                    onChange={(e) => {
                                        setMinerName(e.target.value);
                                    }}
                                    value={minerName}
                                />
                            </InputGroup>
                        </Col>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Schedule</Form.Label>
                            <InputGroup className='mt-1'>
                                <Select>
                                    <option>One time</option>
                                    <option>Every 5 mins</option>
                                    <option>Every 15 mins</option>
                                    <option>Every 30 mins</option>
                                    <option>Every 1 hour</option>
                                    <option>Every 6 hours</option>
                                    <option>Every 12 hours</option>
                                    <option>Every 24 hours</option>
                                    <option>Every 3 days</option>
                                    <option>Every 7 days</option>
                                </Select>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Strategy</Form.Label>
                            <InputGroup className='mt-1'>
                                <Select onChange={setMinerStrategy} value={minerStrategy} options={minerStrategyOptions} />
                            </InputGroup>
                        </Col>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Select up to {minerSize || '-'} datapoints.</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control required placeholder='N' type='number' min={1} value={minerSize} onChange={(e) => {
                                    setMinerSize(Number(e.target.value));
                                }} />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className='g-2'>
                        <Col>
                            {
                                minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'ACTIVATION' || minerStrategy === 'CORESET' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>Analysis Space</Form.Label>
                                        <InputGroup className='mt-1 flex-column'>
                                            <Form.Control as='select' className={'form-select w-100'} required
                                                value={minerAnalysisSpace}
                                                onChange={(e) => {
                                                    setMinerAnalysisSpace(e.target.value);
                                                }}
                                            >
                                                <option disabled>Select Analysis Space</option>
                                                <option value='embeddings'>
                                            Embeddings
                                                </option>
                                                <option value='prediction.embeddings'>
                                            Prediction Embeddings
                                                </option>
                                                <option value='prediction.logits'>
                                            Prediction Logits
                                                </option>
                                            </Form.Control>
                                        </InputGroup>
                                    </>
                                ) : null
                            }
                        </Col>
                        <Col>
                            {
                                minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>Metric</Form.Label>
                                        <InputGroup className='mt-1 flex-column'>
                                            <Form.Control as='select' className={'form-select w-100'} required
                                                value={minerMetric}
                                                onChange={(e) => {
                                                    setMinerMetric(e.target.value);
                                                }}
                                            >
                                                <option disabled>Select Metric</option>
                                                <option value='euclidean'>
                                                    Euclidean
                                                </option>
                                                <option value='cosine'>
                                                    Cosine
                                                </option>
                                            </Form.Control>
                                        </InputGroup>
                                    </>
                                ) : null
                            }
                        </Col>
                    </Row>
                    <hr/>
                    <Row className='g-2'>
                        <Col>
                            <DatasetSelector defaultValue={minerDatasetId} onChange={setMinerDatasetId}>
                                Select Mined Dataset
                            </DatasetSelector>
                            <Form.Label className='mt-3 mb-0 w-100'>
                                {minerDatasetId ? (
                                    <Async fetchData={() => baseJSONClient(`/api/dataset/${minerDatasetId}`)}
                                        renderData={(dataset) => dataset['display_name']}
                                        refetchOnChanged={[minerDatasetId]}
                                    />
                                ) : null}
                            </Form.Label>
                        </Col>
                        {
                            minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET' ? (
                                <Col>
                                    <DatasetSelector defaultValue={minerReferenceDatasetId} onChange={setMinerReferenceDatasetId} >
                                        Select Reference Dataset
                                    </DatasetSelector>
                                    <Form.Label className='mt-3 mb-0 w-100'>
                                        {
                                            minerReferenceDatasetId ? (
                                                <Async fetchData={() => baseJSONClient(`/api/dataset/${minerReferenceDatasetId}`)}
                                                    renderData={(dataset) => dataset['display_name']}
                                                    refetchOnChanged={[minerReferenceDatasetId]}
                                                />
                                            ) : null
                                        }
                                    </Form.Label>
                                </Col>
                            ) : null
                        }
                    </Row>
                </Container>
                <Button
                    className='w-100 text-white btn-submit mt-3'
                    variant='primary'
                    type='submit'
                >
                    {defaultMiner?._id ? 'Update Miner' : 'Create Miner'}
                </Button>
            </Form>
        </Modal>
    );
};

MinerModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onMinerSaved: PropTypes.func,
    defaultMiner: PropTypes.object,
    modelStore: PropTypes.object
};

export default setupComponent(MinerModal);
