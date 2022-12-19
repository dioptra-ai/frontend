/* eslint-disable complexity */
import PropTypes from 'prop-types';
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
import DataSelector from './data-selector';
import {Container} from 'react-bootstrap';

const MinerModal = ({isOpen, onClose, onMinerSaved, defaultMiner = {}}) => {
    const {
        display_name, select, select_reference, size, metric, embeddings_field, strategy
    } = defaultMiner;
    const [minerName, setMinerName] = useState(display_name);
    const [minerMetric, setMinerMetric] = useState(metric || 'euclidean');
    const [minerAnalysisSpace, setMinerAnalysisSpace] = useState(embeddings_field);
    const [minerSize, setMinerSize] = useState(size);
    const [minerFilters, setMinerFilters] = useState(select?.filters || []);
    const [referenceFilters, setReferenceFilters] = useState(select_reference?.filters || []);
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
            select: {
                ...defaultMiner.select,
                filters: minerFilters
            },
            ...((minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET') && referenceFilters.length ? {
                select_reference: {
                    ...defaultMiner.select_reference,
                    filters: referenceFilters
                }
            } : {})
        };

        if (!payload['_id'] || window.confirm('Changing the miner configuration will delete the current results. Are you sure you want to continue?')) {
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
        if (minerAnalysisSpace) {
            const notNullFilter = minerFilters.find((f) => f['op'] === 'is not null');

            if (notNullFilter) {
                notNullFilter['left'] = minerAnalysisSpace;
                setMinerFilters([...minerFilters]);
            } else {
                setMinerFilters([...minerFilters, {
                    left: minerAnalysisSpace,
                    op: 'is not null'
                }]);
            }
        } else {
            setMinerFilters(minerFilters.filter((f) => f['op'] !== 'is not null'));
        }
    }, [minerAnalysisSpace]);

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
                    <Row classname='g-2'>
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
                    <Row classname='g-2'>
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
                    <Row classname='g-2'>
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
                                                <option value='groundtruth.embeddings'>
                                            Groundtruth Embeddings
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
                    <Row classname='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Mined Data</Form.Label>
                            <DataSelector
                                emptyOnUnfiltered
                                onChange={(data) => {
                                    setMinerFilters(data.filters);
                                }}
                                value={{filters: minerFilters}}
                            />
                        </Col>
                        {
                            minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET' ? (
                                <Col>
                                    <Form.Label className='mt-3 mb-0 w-100'>Reference Data</Form.Label>
                                    <DataSelector
                                        emptyOnUnfiltered
                                        onChange={(data) => {
                                            setReferenceFilters(data.filters);
                                        }}
                                        value={{filters: referenceFilters}}
                                    />
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
