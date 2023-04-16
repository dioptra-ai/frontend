/* eslint-disable complexity */
import PropTypes from 'prop-types';
import {setupComponent} from 'helpers/component-helper';
import Modal from 'components/modal';
import Select from 'components/select';
import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import baseJSONClient from 'clients/base-json-client';
import DataSelector from './data-selector';
import {Container} from 'react-bootstrap';
import Async from 'components/async';
import LoadingForm from 'components/loading-form';

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
    value: 'VARIANCE',
    name: 'N Highest Variance'
}, {
    value: 'ACTIVATION',
    name: 'N Lowest Activation'
}, {
    value: 'RANDOM',
    name: 'N at Random'
}];

const MinerModal = ({isOpen, onClose, onMinerSaved, defaultMiner = {}}) => {
    const [minerFilters, setMinerFilters] = useState(defaultMiner['select']?.filters || []);
    const [referenceFilters, setReferenceFilters] = useState(defaultMiner['select_reference']?.filters || []);
    const [minerStrategy, setMinerStrategy] = useState(defaultMiner['strategy']?.strategy || minerStrategyOptions[0].value);

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => onClose()}
            title='Edit Miner'
        >
            <LoadingForm style={{minWidth: 900}} onSubmit={async (e, values) => {
                e.preventDefault();

                if (!defaultMiner['_id'] || window.confirm('Changing the miner configuration will delete the current results. Do you really want to continue?')) {
                    const miner = await baseJSONClient.post('/api/tasks/miners', {
                        ...defaultMiner,
                        ...values,
                        select: {
                            filters: minerFilters
                        },
                        select_reference: {
                            filters: referenceFilters
                        }
                    });

                    onMinerSaved?.(miner['miner_id']);
                }
            }}>
                <Container fluid>
                    <Row className='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Miner Name</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control
                                    required
                                    name='display_name'
                                    defaultValue={defaultMiner.display_name}
                                />
                            </InputGroup>
                        </Col>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Schedule</Form.Label>
                            <InputGroup className='mt-1'>
                                <Select name='evaluation_period' defaultValue={defaultMiner.evaluation_period}>
                                    <option value=''>One time</option>
                                    <option value='PT5M'>Every 5 mins</option>
                                    <option value='PT15M'>Every 15 mins</option>
                                    <option value='PT30M'>Every 30 mins</option>
                                    <option value='PT1H'>Every 1 hour</option>
                                    <option value='PT2H'>Every 2 hours</option>
                                    <option value='PT4H'>Every 4 hours</option>
                                    <option value='PT8H'>Every 8 hours</option>
                                    <option value='PT12H'>Every 12 hours</option>
                                    <option value='P1D'>Every 1 day</option>
                                    <option value='P2D'>Every 2 days</option>
                                    <option value='P3D'>Every 3 days</option>
                                    <option value='P4D'>Every 4 days</option>
                                    <option value='P5D'>Every 5 days</option>
                                    <option value='P6D'>Every 6 days</option>
                                    <option value='P7D'>Every 7 days</option>
                                </Select>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Strategy</Form.Label>
                            <InputGroup className='mt-1'>
                                <Select name='strategy' value={minerStrategy} onChange={setMinerStrategy}>
                                    {minerStrategyOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.name}</option>
                                    ))}
                                </Select>
                            </InputGroup>
                        </Col>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Select N datapoints.</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control required placeholder='N' type='number' min={1} name='size' defaultValue={defaultMiner['size']} />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className='g-2'>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Model Name</Form.Label>
                            <InputGroup className='mt-1'>
                                <Async fetchData={() => baseJSONClient.post('/api/predictions/select-distinct-model-names', {
                                    datapointFilters: minerFilters,
                                    limit: 100
                                })}
                                refetchOnChanged={[minerFilters]}
                                renderData={(data) => {
                                    return (
                                        <Form.Control as='select' className={'form-select w-100'} required
                                            name='model_name'
                                            defaultValue={defaultMiner['model_name']}
                                        >
                                            <option disabled>Select Model Name</option>
                                            {
                                                data.map((modelName) => (
                                                    <option value={modelName} key={modelName}>
                                                        {modelName}
                                                    </option>
                                                ))
                                            }
                                        </Form.Control>
                                    );
                                }} />
                            </InputGroup>
                        </Col>
                        {
                            minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'ACTIVATION' || minerStrategy === 'CORESET' ? (
                                <Col>
                                    <Form.Label className='mt-3 mb-0 w-100'>Analysis Space</Form.Label>
                                    <InputGroup className='mt-1 flex-column'>
                                        <Form.Control as='select' className={'form-select w-100'} required
                                            name='embeddings_field'
                                            defaultValue={defaultMiner['embeddings_field']}
                                        >
                                            <option disabled>Select Analysis Space</option>
                                            <option value='embeddings'>
                                                Embeddings
                                            </option>
                                            <option value='logits'>
                                                Logits
                                            </option>
                                        </Form.Control>
                                    </InputGroup>
                                </Col>
                            ) : null
                        }
                        {
                            minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET' ? (
                                <Col>
                                    <Form.Label className='mt-3 mb-0 w-100'>Metric</Form.Label>
                                    <InputGroup className='mt-1 flex-column'>
                                        <Form.Control as='select' className={'form-select w-100'} required
                                            name='metric'
                                            defaultValue={defaultMiner['metric']}
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
                                </Col>
                            ) : null
                        }
                    </Row>
                    <hr/>
                    <Row className='g-2'>
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
            </LoadingForm>
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
