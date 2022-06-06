/* eslint-disable complexity */
import PropTypes from 'prop-types';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import DateTimeRangePicker from 'components/date-time-range-picker';
import Modal from 'components/modal';
import Select from 'components/select';
import {lastMilliseconds} from 'helpers/date-helper';
import useModel from 'hooks/use-model';
import moment from 'moment';
import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Error from 'components/error';
import {setupComponent} from 'helpers/component-helper';

const IsoDurations = {
    PT30M: {value: 'PT30M', name: '30 minutes'},
    PT1H: {value: 'PT1H', name: '1 hour'},
    PT6H: {value: 'PT6H', name: '6 hours'},
    PT12H: {value: 'PT12H', name: '12 hours'},
    P1D: {value: 'P1D', name: '1 day'},
    P7D: {value: 'P7D', name: '7 days'}
};


const MinerModal = ({isOpen, onClose, onMinerCreated, uuids, modelStore}) => {
    const contextModel = useModel();
    const [minerDatasetSelected, setMinerDatasetSelected] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState();
    const [minerName, setMinerName] = useState();
    const [referencePeriod, setReferencePeriod] = useState({
        start: moment(),
        end: moment().add(5, 'minutes')
    });
    const [evaluationPeriod, setEvaluationPeriod] = useState();
    const [liveDataType, setLiveDataType] = useState('range');
    const [minerStrategy, setMinerStrategy] = useState(uuids ? 'LOCAL_OUTLIER' : 'ENTROPY');
    const [minerMetric, setMinerMetric] = useState('euclidean');
    const [minerLimit, setMinerLimit] = useState();
    const [minerModel, setMinerModel] = useState(contextModel);

    const onDatasetDateChange = ({start, end, lastMs}) => {
        let isoStart = null;

        let isoEnd = null;

        if (lastMs) {
            const e = moment();
            const s = lastMilliseconds(lastMs)[0];

            isoStart = s.toISOString();
            isoEnd = e.toISOString();
        } else {
            isoStart = start.toISOString();
            isoEnd = end.toISOString();
        }
        setReferencePeriod({start: isoStart, end: isoEnd});
    };

    const createMiner = async () => {
        const payload = {
            uuids,
            display_name: minerName,
            ml_model_id: minerModel?.mlModelId,
            strategy: minerStrategy,
            metric: minerMetric,
            limit: minerLimit
        };

        if (!minerDatasetSelected) {
            if (liveDataType === 'range') {
                payload['start_time'] = referencePeriod.start;
                payload['end_time'] = referencePeriod.end;
            } else {
                payload['evaluation_period'] = evaluationPeriod;
            }
        } else {
            payload['dataset_id'] = selectedDataset;
        }

        await metricsClient('miners', payload).catch(console.error);

        if (onMinerCreated) {

            onMinerCreated();
        } else {

            onClose();
        }
    };

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onClose={() => onClose()}
                title={uuids ? 'Mine for Similar Datapoints' : 'Mine for Datapoints'}
            >
                <Form style={{minWidth: 900}} onSubmit={(e) => {
                    e.preventDefault();
                    createMiner();
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
                                />
                            </InputGroup>
                            <Form.Label className='mt-3 mb-0 w-100'>Strategy</Form.Label>
                            <InputGroup className='mt-1 flex-column'>
                                <Select onChange={setMinerStrategy}>
                                    {
                                        uuids ? (
                                            <>
                                                <option value='LOCAL_OUTLIER'>
                                                Local Outlier Factor
                                                </option>
                                                <option value='NEAREST_NEIGHBORS'>
                                                Top N Nearest Neighbors
                                                </option>
                                                <option value='CORESET'>
                                                Coreset
                                                </option>
                                            </>
                                        ) : (
                                            <>
                                                <option value='ENTROPY'>
                                                Top N Highest Entropy
                                                </option>
                                                <option value='CORESET'>
                                                Coreset
                                                </option>
                                            </>
                                        )
                                    }
                                </Select>
                            </InputGroup>
                            {
                                minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'CORESET' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>Metric</Form.Label>
                                        <InputGroup className='mt-1 flex-column'>
                                            <Form.Control as='select' className={'form-select w-100'} required defaultValue={minerMetric}
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
                                minerStrategy === 'NEAREST_NEIGHBORS' || minerStrategy === 'ENTROPY' || minerStrategy === 'CORESET' ? (
                                    <>
                                        <Form.Label className='mt-3 mb-0 w-100'>N</Form.Label>
                                        <Form.Control required type='number' min={1} onChange={(e) => {
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
                            <Form.Label className='mt-3 mb-0 w-100'>Source</Form.Label>
                            <InputGroup className='mt-1 flex-column'>
                                <Form.Control
                                    as='select'
                                    className={'form-select w-100'}
                                    custom
                                    required
                                    onChange={(e) => {
                                        setMinerDatasetSelected(
                                            e.target.value === 'true'
                                        );
                                    }}
                                >
                                    <option value={false}>
                                    Live traffic of {minerModel ? `"${minerModel.name}"` : 'a model'}
                                    </option>
                                    <option value={true}>Dataset</option>
                                </Form.Control>
                            </InputGroup>
                            {minerDatasetSelected ? (
                                <>
                                    <Form.Label className='mt-3 mb-0 w-100'>
                                    Dataset
                                    </Form.Label>
                                    <InputGroup className='mt-1'>
                                        <Async
                                            fetchData={() => metricsClient('datasets', null, 'get')
                                            }
                                            renderData={(datasets) => (
                                                <Form.Control
                                                    as='select'
                                                    className='form-select w-100'
                                                    custom
                                                    required
                                                    onChange={(e) => {
                                                        const value = e.target.value;

                                                        if (value !== 'desc') {
                                                            setSelectedDataset(value);
                                                        }
                                                    }}
                                                >
                                                    <option value='desc'>
                                                    Select Dataset
                                                    </option>
                                                    {datasets.map((dataset) => {
                                                        return (
                                                            <option
                                                                key={dataset.dataset_id}
                                                                value={
                                                                    dataset.dataset_id
                                                                }
                                                            >
                                                                {dataset.dataset_id}
                                                            </option>
                                                        );
                                                    })}
                                                </Form.Control>
                                            )}
                                        />
                                    </InputGroup>
                                </>
                            ) : (
                                <>

                                    <Form.Label className='mt-3 mb-0 w-100'>Model</Form.Label>
                                    <InputGroup className='mt-1 flex-column'>
                                        <Form.Control
                                            as='select'
                                            className='form-select w-100'
                                            custom
                                            required
                                            onChange={(e) => {
                                                setMinerModel(modelStore.getModelById(e.target.value));
                                            }}
                                            defaultValue={minerModel?._id}
                                        >
                                            {
                                                modelStore.models.map((model) => (
                                                    <option value={model._id} key={model._id}>{model.name}</option>
                                                ))
                                            }
                                        </Form.Control>
                                    </InputGroup>
                                    <div>
                                        <ToggleButtonGroup
                                            defaultValue={liveDataType}
                                            type='radio'
                                            className='mt-4'
                                            onChange={setLiveDataType}
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
                                                    end={
                                                        referencePeriod ?
                                                            moment(referencePeriod.end) :
                                                            null
                                                    }
                                                    onChange={onDatasetDateChange}
                                                    start={
                                                        referencePeriod ?
                                                            moment(referencePeriod.start) :
                                                            null
                                                    }
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
                                                    backgroundColor='white'
                                                    initialValue={
                                                        evaluationPeriod ||
                                                IsoDurations.PT30M.value
                                                    }
                                                    isTextBold
                                                    onChange={setEvaluationPeriod}
                                                    options={Object.values(IsoDurations)}
                                                    textColor='primary'
                                                    selectValue={
                                                        evaluationPeriod ||
                                                IsoDurations.PT30M.value
                                                    }
                                                />
                                            </InputGroup>
                                        )}
                                    </div>
                                </>
                            )}
                            {minerStrategy === 'LOCAL_OUTLIER' && uuids?.length < 50 ? (
                                <div className='mt-3'>
                                    <Error error={`${uuids.length} samples are selected but at least fifty (50) are required to run a Local Outlier Factor miner.`} variant='warning'/>
                                </div>
                            ) : null}
                        </Col>
                    </Row>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        variant='primary'
                        type='submit'
                        disabled={minerStrategy === 'LOCAL_OUTLIER' && uuids?.length < 50}
                    >
                        Create Miner
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

MinerModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onMinerCreated: PropTypes.func,
    uuids: PropTypes.array,
    modelStore: PropTypes.object
};

export default setupComponent(MinerModal);
