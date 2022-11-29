/* eslint-disable complexity */
import PropTypes from 'prop-types';
import DateTimeRangePicker from 'components/date-time-range-picker';
import Modal from 'components/modal';
import Select from 'components/select';
import moment from 'moment';
import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'pages/common/filter-input';
import CountEvents from './count-events';
import baseJSONClient from 'clients/base-json-client';

const IsoDurations = [
    {value: 'PT30M', name: '30 minutes'},
    {value: 'PT1H', name: '1 hour'},
    {value: 'PT6H', name: '6 hours'},
    {value: 'PT12H', name: '12 hours'},
    {value: 'P1D', name: '1 day'},
    {value: 'P7D', name: '7 days'}
];


const MinerModal = ({isOpen, onClose, onMinerSaved, defaultMiner = {}, modelStore}) => {
    const {
        uuids, display_name, start_time, end_time, evaluation_period,
        metric, embeddings_field, limit, duplication_factor, ml_model_id,
        filters, strategy
    } = defaultMiner;
    const [minerName, setMinerName] = useState(display_name);
    const [referencePeriod, setReferencePeriod] = useState({
        start: start_time ? moment(start_time) : moment(),
        end: end_time ? moment(end_time) : moment().add(5, 'minutes')
    });
    const [evaluationPeriod, setEvaluationPeriod] = useState(evaluation_period || IsoDurations[0].value);
    const [liveDataType, setLiveDataType] = useState(evaluation_period ? 'duration' : 'range');
    const [minerMetric, setMinerMetric] = useState(metric || 'euclidean');
    const [minerAnalysisSpace, setMinerAnalysisSpace] = useState(embeddings_field || 'embeddings');
    const [minerLimit, setMinerLimit] = useState(limit);
    const [minerDuplicationFactor, setMinerDuplicationFactor] = useState(duplication_factor || 1);
    const [minerModel, setMinerModel] = useState(ml_model_id ? modelStore.getModelByMlModelId(ml_model_id) : modelStore.models[0]);
    const [minerFilters, setMinerFilters] = useState(filters || []);
    const minerStrategyOptions = uuids ? [{
        value: 'NEAREST_NEIGHBORS',
        name: 'K Nearest Neighbors'
    }, {
        value: 'CORESET',
        name: 'Coreset'
    }] : [{
        value: 'ENTROPY',
        name: 'K Highest Entropy'
    }, {
        value: 'ACTIVATION',
        name: 'K Lowest Activation'
    }];
    const [minerStrategy, setMinerStrategy] = useState(strategy || minerStrategyOptions[0].value);

    const onDatasetDateChange = ({start, end, lastMs}) => {

        if (lastMs) {
            start = moment().subtract(lastMs, 'milliseconds');
            end = moment();
        }

        setReferencePeriod({start, end});
    };

    const saveMiner = async () => {
        const payload = {
            ...defaultMiner,
            display_name: minerName,
            ml_model_id: minerModel?.mlModelId,
            strategy: minerStrategy,
            duplication_factor: minerDuplicationFactor,
            metric: minerMetric,
            limit: minerLimit,
            embeddings_field: minerAnalysisSpace,
            filters: minerFilters
        };

        if (liveDataType === 'range') {
            payload['start_time'] = referencePeriod.start.toISOString();
            payload['end_time'] = referencePeriod.end.toISOString();
            payload['evaluation_period'] = null;
        } else {
            payload['start_time'] = null;
            payload['end_time'] = null;
            payload['evaluation_period'] = evaluationPeriod;
        }

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

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onClose={() => onClose()}
                title='Edit Miner'
            >
                <Form style={{minWidth: 900}} onSubmit={(e) => {
                    e.preventDefault();
                    saveMiner();
                }}
                >
                    <div>
                        {
                            uuids ? (
                                `Create a new miner that will search for datapoints that are close to the selected ${uuids.length} examples in the embedding space.`
                            ) : (
                                'Create a new miner that will search for datapoints in the embedding space.'
                            )
                        }
                    </div>
                    <Row>
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
                            <Form.Label className='mt-3 mb-0 w-100'>Strategy</Form.Label>
                            <InputGroup className='mt-1 flex-column'>
                                <Select onChange={setMinerStrategy} value={minerStrategy} options={minerStrategyOptions}/>
                            </InputGroup>
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
                                                <option value='"prediction.embeddings"'>
                                                Prediction Embeddings
                                                </option>
                                                <option value='"groundtruth.embeddings"'>
                                                Groundtruth Embeddings
                                                </option>
                                                <option value='"prediction.logits"'>
                                                Prediction Logits
                                                </option>
                                            </Form.Control>
                                        </InputGroup>
                                    </>
                                ) : null
                            }
                            {
                                minerStrategy === 'NEAREST_NEIGHBORS' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>K</Form.Label>
                                        <Form.Control required type='number' min={1} value={minerLimit} onChange={(e) => {
                                            setMinerLimit(Number(e.target.value));
                                        }}/>
                                        <Form.Text className='text-muted'>
                                        The miner will select up to {minerLimit || '-'} datapoints.
                                        </Form.Text>
                                        <Form.Label className='mt-3 mb-0 w-100'>Duplication Factor</Form.Label>
                                        <Form.Control type='number' step='0.01' min={1} value={minerDuplicationFactor}
                                            onChange={(e) => {
                                                setMinerDuplicationFactor(Number(e.target.value));
                                            }}/>
                                        <Form.Text className='text-muted'>
                                        The estimated number of near duplicates per datapoint (including itself).
                                        </Form.Text>
                                    </>
                                ) : minerStrategy === 'ENTROPY' || minerStrategy === 'CORESET' || minerStrategy === 'ACTIVATION' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>K</Form.Label>
                                        <Form.Control required type='number' min={1} value={minerLimit} onChange={(e) => {
                                            setMinerLimit(Number(e.target.value));
                                        }}/>
                                        <Form.Text className='text-muted'>
                                        The miner will select up to {minerLimit || '-'} datapoints.
                                        </Form.Text>
                                    </>
                                ) : null
                            }
                        </Col>
                        <Col>
                            <Form.Label className='mt-3 mb-0 w-100'>Model</Form.Label>
                            <InputGroup className='mt-1 flex-column'>
                                <Select required
                                    onChange={(id) => {
                                        setMinerModel(modelStore.getModelById(id));
                                    }}
                                    value={minerModel?._id}
                                >
                                    {
                                        modelStore.models.map((model) => (
                                            <option value={model._id} key={model._id}>{model.name}</option>
                                        ))
                                    }
                                </Select>
                            </InputGroup>
                            <div>
                                <ToggleButtonGroup
                                    type='radio'
                                    className='mt-4'
                                    onChange={setLiveDataType}
                                    value={liveDataType}
                                    name='benchmark-type'
                                >
                                    <ToggleButton
                                        variant='light'
                                        id='range'
                                        value='range'
                                    >
                                &nbsp;Past Time Range
                                    </ToggleButton>
                                    <ToggleButton
                                        variant='light'
                                        id='duration'
                                        value='duration'
                                    >
                                &nbsp;Periodic Schedule
                                    </ToggleButton>
                                </ToggleButtonGroup>
                                {liveDataType === 'range' && (
                                    <InputGroup className='mt-1'>
                                        <Form.Label className='mt-3 mb-0 w-100'>
                                        Date range
                                        </Form.Label>
                                        <DateTimeRangePicker
                                            datePickerSettings={{
                                                opens: 'center',
                                                drops: 'up'
                                            }}
                                            end={referencePeriod?.end}
                                            onChange={onDatasetDateChange}
                                            start={referencePeriod?.start}
                                            width='100%'
                                        />
                                    </InputGroup>
                                )}
                                {liveDataType === 'duration' && (
                                    <InputGroup className='mt-1'>
                                        <Form.Label className='mt-3 mb-0 w-100'>
                                        Mine latest data every
                                        </Form.Label>
                                        <Select
                                            value={evaluationPeriod}
                                            onChange={setEvaluationPeriod}
                                            options={Object.values(IsoDurations)}
                                            textColor='primary'
                                        />
                                    </InputGroup>
                                )}
                            </div>
                            <InputGroup className='mt-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>
                                    Filter Miner Input
                                </Form.Label>
                                <div className='w-100'>
                                    <FilterInput onChange={setMinerFilters} value={minerFilters}/>
                                </div>
                            </InputGroup>
                            <div className='my-3'>
                                Miner Input: <CountEvents className='d-inline' filters={[
                                    ...minerFilters,
                                    ...(minerModel ? [{left: 'model_id', 'op': '=', right: minerModel.mlModelId}] : []),
                                    {left: 'timestamp', op: '>=', right: referencePeriod.start.toISOString()},
                                    {left: 'timestamp', op: '<', right: referencePeriod.end.toISOString()}
                                ]}/> datapoints.
                            </div>
                        </Col>
                    </Row>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        variant='primary'
                        type='submit'
                    >
                        {defaultMiner?._id ? 'Update Miner' : 'Create Miner'}
                    </Button>
                </Form>
            </Modal>
        </div>
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
