import metricsClient from 'clients/metrics';
import Async from 'components/async';
import DateTimeRangePicker from 'components/date-time-range-picker';
import Modal from 'components/modal';
import Select from 'components/select';
import {lastMilliseconds} from 'helpers/date-helper';
import useModel from 'hooks/use-model';
import {PropTypes} from 'mobx-react';
import moment from 'moment';
import {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

const IsoDurations = {
    PT30M: {value: 'PT30M', name: '30 minutes'},
    PT1H: {value: 'PT1H', name: '1 hour'},
    PT6H: {value: 'PT6H', name: '6 hours'},
    PT12H: {value: 'PT12H', name: '12 hours'},
    P1D: {value: 'P1D', name: '1 day'},
    P7D: {value: 'P7D', name: '7 days'}
};


const MinerModal = ({isOpen, closeCallback, samples}) => {
    const [minerDatasetSelected, setMinerDatasetSelected] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState();
    const [minerName, setMinerName] = useState();
    const [referencePeriod, setReferencePeriod] = useState({
        start: moment(),
        end: moment().add(5, 'minutes')
    });
    const [requestIds, setRequestIds] = useState([]);
    const [evaluationPeriod, setEvaluationPeriod] = useState();
    const [liveDataType, setLiveDataType] = useState('range');

    const model = useModel();

    useEffect(() => {
        setRequestIds(samples.map((selectedPoint) => selectedPoint.request_id));
    }, [samples]);

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
        console.log({start: isoStart, end: isoEnd});
    };

    const createMiner = () => {
        const payload = {
            request_ids: requestIds,
            display_name: minerName
        };

        if (!minerDatasetSelected) {
            payload['ml_model_id'] = model.mlModelId;
            if (liveDataType === 'range') {
                payload['start_time'] = referencePeriod.start;
                payload['end_time'] = referencePeriod.end;
            } else {
                payload['evaluation_period'] = evaluationPeriod;
            }
        } else {
            payload['dataset'] = selectedDataset;
        }
        metricsClient('miners', payload).catch(console.error);
        setMinerDatasetSelected(false);
        setSelectedDataset(null);
        setReferencePeriod({});
        closeCallback();
    };

    return (
        <div>
            {isOpen ? (
                <Modal
                    isOpen
                    onClose={() => closeCallback()}
                    title='Mine for Similar Datapoints'
                >
                    <div style={{width: 500}}>
                        Create a new miner that will search for datapoints that are
                        close to the selected {samples.length} examples in the
                        embedding space.
                    </div>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createMiner();
                        }}
                    >
                        <Form.Label className='mt-3 mb-0 w-100'>Name</Form.Label>
                        <InputGroup className='mt-1'>
                            <Form.Control
                                required
                                onChange={(e) => {
                                    setMinerName(e.target.value);
                                }}
                            />
                        </InputGroup>
                        <Form.Label className='mt-3 mb-0 w-100'>Source</Form.Label>
                        <InputGroup className='mt-1 flex-column'>
                            <Form.Control
                                as='select'
                                className={'form-select bg-light w-100'}
                                custom
                                required
                                onChange={(e) => {
                                    setMinerDatasetSelected(
                                        e.target.value === 'true'
                                    );
                                }}
                            >
                                <option disabled>Select Source</option>
                                <option value={false}>
                                    Live traffic of "{model.name}"
                                </option>
                                <option value={true}>Dataset</option>
                            </Form.Control>
                        </InputGroup>
                        {!minerDatasetSelected && (
                            <div>
                                <ToggleButtonGroup
                                    defaultValue={liveDataType}
                                    type='radio'
                                    className='mt-4'
                                    onChange={setLiveDataType}
                                    name='benchmark-type'
                                >
                                    <ToggleButton
                                        variant='outline-secondary'
                                        id='range'
                                        value='range'
                                    >
                                        &nbsp;Past Time Range
                                    </ToggleButton>
                                    <ToggleButton
                                        variant='outline-secondary'
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
                        )}
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
                                                className={
                                                    'form-select bg-light w-100'
                                                }
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
                        ) : null}
                        <Button
                            className='w-100 text-white btn-submit mt-3'
                            variant='primary'
                            type='submit'
                            disabled={
                                requestIds === [] ||
                                (minerDatasetSelected && !selectedDataset) ||
                                (!minerDatasetSelected &&
                                    liveDataType === 'range' &&
                                    !referencePeriod) ||
                                (!minerDatasetSelected &&
                                    liveDataType === 'duration' &&
                                    !evaluationPeriod)
                            }
                            onClick={() => createMiner()}
                        >
                            Create Miner
                        </Button>
                    </Form>
                </Modal>
            ) : null}
        </div>
    );
};

MinerModal.propTypes = {
    isOpen: PropTypes.bool,
    closeCallback: PropTypes.func,
    samples: PropTypes.array
};

export default MinerModal;
