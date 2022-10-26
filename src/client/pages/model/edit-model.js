import React, {useState} from 'react';
import {Button, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import moment from 'moment';
import PropTypes from 'prop-types';

import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';
import {lastMilliseconds} from 'helpers/date-helper';
import Async from 'components/async';
import metricsClient from 'clients/metrics';

const EditModel = ({initialValue, onSubmit, errors, modelStore}) => {
    const [formData, setFormData] = useState({
        name: '',
        mlModelId: '',
        description: '',
        mlModelType: '',
        referencePeriod: null,
        referenceBenchmarkId: null,
        ...initialValue
    });
    const [benchmarkType, setBenchmarkType] = useState(initialValue.referenceBenchmarkId ? 'benchmark-run' : 'date-range');
    const handleChange = (event) => setFormData({...formData, [event.target.name]: event.target.value});
    const onBenchmarkDateChange = ({start, end, lastMs}) => {
        let isoStart = null;

        let isoEnd = null;

        if (lastMs) {
            const e = moment();
            const s = lastMilliseconds()[0];

            isoStart = s.toISOString();
            isoEnd = e.toISOString();
        } else {
            isoStart = start.toISOString();
            isoEnd = end.toISOString();
        }

        setFormData({
            ...formData,
            referencePeriod: {start: isoStart, end: isoEnd},
            referenceBenchmarkId: null
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Container
            className='model fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='model-form d-flex flex-column align-items-center'>
                {errors?.length ? errors.map((e, i) => (
                    <div key={i} className='bg-warning text-white p-3 mt-2'>{e}</div>
                )) : null}
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Row>
                        <Col>
                            <Form.Label className='mt-3 mb-0'>Benchmark</Form.Label>
                            <InputGroup className='mt-1 text-center'>
                                <ToggleButtonGroup defaultValue={benchmarkType} type='radio' onChange={setBenchmarkType} name='benchmark-type'>
                                    <ToggleButton variant='outline-secondary' id='date-range' value='date-range'>&nbsp;Date Range</ToggleButton>
                                    <ToggleButton variant='outline-secondary' id='benchmark-run' value='benchmark-run'>&nbsp;Benchmark Run</ToggleButton>
                                </ToggleButtonGroup>
                                <div className='m-1'>
                                    {
                                        benchmarkType === 'date-range' ? (
                                            <DateTimeRangePicker
                                                datePickerSettings={{
                                                    opens: 'center'
                                                }}
                                                end={moment(formData?.referencePeriod?.end)}
                                                onChange={onBenchmarkDateChange}
                                                start={moment(formData?.referencePeriod?.start)}
                                                width='100%'
                                            />
                                        ) : benchmarkType === 'benchmark-run' ? (
                                            <Async
                                                fetchData={() => metricsClient(`benchmarks?sql_filters=${encodeURI(
                                                    `model_id='${formData.mlModelId}'`
                                                )}`)}
                                                renderData={(benchmarks) => (
                                                    <Form.Control
                                                        as='select'
                                                        className='form-select'
                                                        name='referenceBenchmarkId'
                                                        value={formData.referenceBenchmarkId}
                                                        onChange={handleChange}
                                                        custom
                                                        required
                                                    >
                                                        {
                                                            benchmarks.map((b, i) => {
                                                                const model = modelStore.models.find((m) => m.mlModelId === b.model_id);

                                                                if (model) {

                                                                    return (
                                                                        <option key={i} value={b.benchmark_id}>{model?.name} {b.model_version} [{new Date(b.started_at).toLocaleString()}]</option>
                                                                    );
                                                                } else {

                                                                    return (
                                                                        <option key={i} value={null}>{'<unknown model>'}</option>
                                                                    );
                                                                }
                                                            })
                                                        }
                                                    </Form.Control>
                                                )}
                                            />
                                        ) : null
                                    }
                                </div>
                            </InputGroup>
                            <Form.Label className='mt-3 mb-0'>Model ID</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control
                                    name='mlModelId'
                                    onChange={handleChange}
                                    placeholder='Enter Model ID'
                                    type='text'
                                    value={formData.mlModelId}
                                    disabled={Boolean(Object.keys(initialValue).length)}
                                    required
                                />
                            </InputGroup>
                            <Form.Text className='text-muted'>
                                <div>Use this id to send data to Dioptra in real-time.</div><div>See the <a href='/documentation/supported_types/'>docs</a> for supported data formats.</div>
                            </Form.Text>
                            <Form.Label className='mt-3 mb-0'>Name</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control
                                    name='name'
                                    onChange={handleChange}
                                    placeholder='Enter Model Name'
                                    type='text'
                                    value={formData.name}
                                    required
                                />
                            </InputGroup>
                            <Form.Label className='mt-3 mb-0'>Description</Form.Label>
                            <InputGroup className='mt-1'>
                                <textarea
                                    className={'form-control textarea'}
                                    name='description'
                                    onChange={handleChange}
                                    placeholder='Enter Model Description'
                                    rows={3}
                                    type='textarea'
                                    value={formData.description}
                                    required
                                />
                            </InputGroup>
                            <Form.Label className='mt-3 mb-0'>Type</Form.Label>
                            <InputGroup className='mt-1 position-relative'>
                                <Form.Control
                                    as='select'
                                    className={'form-select'}
                                    name='mlModelType'
                                    value={formData.mlModelType}
                                    onChange={handleChange}
                                    custom
                                    required
                                >
                                    <option disabled value=''>Select ML Model Type</option>
                                    <option value='IMAGE_CLASSIFIER'>Image Classifier</option>
                                    <option value='UNSUPERVISED_IMAGE_CLASSIFIER'>Unsupervised Image Classifier</option>
                                    {/* <option value='TABULAR_CLASSIFIER'>Tabular Classifier</option> */}
                                    { <option value='DOCUMENT_PROCESSING'>Document Processing</option> }
                                    {/* <option value='Q_N_A'>Question Answering</option> */}
                                    <option value='TEXT_CLASSIFIER'>Text Classifier</option>
                                    <option value='UNSUPERVISED_TEXT_CLASSIFIER'>Unsupervised Text Classifier</option>
                                    <option value='UNSUPERVISED_OBJECT_DETECTION'>Unsupervised Object Detection</option>
                                    <option value='NER'>Named Entity Recognition</option>
                                    <option value='LEARNING_TO_RANK'>Learning to Rank</option>
                                    {/* <option value='SPEECH_TO_TEXT'>Speech to Text</option> */}
                                    {/* <option value='AUTO_COMPLETION'>Auto Completion</option> */}
                                    {/* <option value='SEMANTIC_SIMILARITY'>Semantic Similarity</option> */}
                                    {/* <option value='MULTIPLE_OBJECT_TRACKING'>Multiple Object Tracking</option> */}
                                </Form.Control>
                            </InputGroup>
                        </Col>
                    </Row>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        variant='primary' type='submit'
                    >
                        {Object.keys(initialValue).length ? 'Update Model' : 'Create Model'}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

EditModel.propTypes = {
    errors: PropTypes.array,
    initialValue: PropTypes.object,
    onSubmit: PropTypes.func,
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(EditModel);
