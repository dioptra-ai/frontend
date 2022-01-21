import React, {useEffect, useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import baseJsonClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import Select from '../../components/select';
import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';


const ModelForm = ({initialValue, onSubmit, errors}) => {
    const [formData, setFormData] = useState({
        name: '',
        mlModelId: '',
        description: '',
        mlModelType: '',
        benchmarkSet: false,
        referencePeriod: {
            start: moment(0),
            end: moment()
        },
        benchmarkModel: '',
        benchmarkMlModelVersion: '',
        benchmarkType: 'timeframe',
        ...initialValue
    });
    const [allMlModelVersions, setAllMlModelVersions] = useState([]);
    const [allModelNames, setAllModelNames] = useState([]);
    const [allDatasetIds, setAllDatasetIds] = useState([]);
    const [showTimeframe, setShowTimeframe] = useState(false);
    const [showDataset, setShowDataset] = useState(false);
    const [benchmarkModel, setbenchmarkModel] = initialValue.benchmarkModel ? useState(initialValue.benchmarkModel) : useState('');
    const [benchmarkType, setBenchmarkType] = initialValue.benchmarkType ? useState(initialValue.benchmarkType) : useState('');
    const [referencePeriod, setReferencePeriod] = initialValue.referencePeriod ? useState(initialValue.referencePeriod) : useState({start: moment(0), end: moment()});
    const [datasetId, setDatasetId] = initialValue.datasetId ? useState(initialValue.datasetId) : useState('');


    useEffect(() => {
        baseJsonClient('/api/ml-model')
            .then((res) => {
                setAllModelNames([
                    ...res.map((model) => ({name: model.mlModelId, value: model.mlModelId}))
                ]);
            });
    }, []);

    const clearBenchmarkData = () => {
        setbenchmarkModel('');
        setBenchmarkType('');
        setReferencePeriod({start: moment(0), end: moment()});
        setFormData({
            ...formData,
            // referencePeriod: {
            //     start: moment(0),
            //     end: moment()
            // },
            benchmarkSet: false,
            benchmarkMlModelVersion: ''
            // benchmarkModel: '',
            // benchmarkType: ''
        });
        // Can we force a re-render here?
    };

    const handleChange = (event) => setFormData({...formData, [event.target.name]: event.target.value});

    const onDateChange = ({start, end}) => setReferencePeriod({start: start.toISOString(), end: end.toISOString()});

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((benchmarkModel && formData.benchmarkMlModelVersion) || (!benchmarkModel && !formData.benchmarkMlModelVersion)) {
            formData.benchmarkModel = benchmarkModel;
            formData.benchmarkType = benchmarkType;
            formData.referencePeriod = referencePeriod;
            onSubmit(formData);
        } else {
            console.log('Clear benchmarks or fill out all benchmark fields');
        }
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
                            <option value='TABULAR_CLASSIFIER'>Tabular Classifier</option>
                            <option value='DOCUMENT_PROCESSING'>Document Processing</option>
                            <option value='Q_N_A'>Question Answering</option>
                            <option value='TEXT_CLASSIFIER'>Text Classifier</option>
                        </Form.Control>
                    </InputGroup>
                    <Form.Label className='bold-text fs-5 mt-3 mb-0'>Select benchmark type</Form.Label>
                    <InputGroup className='mt-1'>
                        <label className='border border-1 px-4 py-3 rounded-3 me-3'>
                            <input
                                type='radio'
                                value='referenceTimeframe'
                                name='rad'
                                onChange={() => {
                                    setShowTimeframe(false);
                                    setShowDataset(false);
                                    setBenchmarkType('');
                                }}
                            />
                            None
                        </label>
                        <label className='border border-1 px-4 py-3 rounded-3 me-3'>
                            <input
                                type='radio'
                                value='offlineDataset'
                                name='rad'
                                onChange={() => {
                                    setShowTimeframe(false);
                                    setShowDataset(true);
                                    setBenchmarkType('dataset');
                                }}
                                disabled
                            />
                            Dataset
                        </label>
                        <label className='border border-1 px-4 py-3 rounded-3 me-3'>
                            <input
                                type='radio'
                                value='referenceTimeframe'
                                name='rad'
                                onChange={() => {
                                    setShowTimeframe(true);
                                    setShowDataset(false);
                                    setBenchmarkType('timeframe');
                                }}
                            />
                            Timeframe
                        </label>
                    </InputGroup>
                    <div style={{display: (showTimeframe ? 'block' : 'none')}}>
                        <InputGroup className='mt-3 text-center'>
                            <Form.Label>Benchmark Date Range</Form.Label>
                            <DateTimeRangePicker
                                classNames='justify-content-around bg-light'
                                datePickerSettings={{
                                    opens: 'center'
                                }}
                                // end={moment(formData?.referencePeriod?.end)}
                                end={moment(referencePeriod?.end)}
                                onChange={onDateChange}
                                // start={moment(formData?.referencePeriod?.start)}
                                start={moment(referencePeriod?.start)}
                                width='100%'
                            />
                        </InputGroup>
                        <InputGroup className='mt-1 position-relative'>
                            <p className='bold-text fs-5'>Benchmark Model Name</p>
                            {
                                <Select
                                    initialValue={formData.benchmarkModel}
                                    options={allModelNames}
                                    onChange={(n) => {
                                        setbenchmarkModel(n);

                                        metricsClient('model-versions-for-model', { // Only needs to be called when the chosen ml-model changes
                                            model_id: n
                                        })
                                            .then((data) => {
                                                setAllMlModelVersions([
                                                    ...data.map((v) => ({name: v.model_version, value: v.model_version}))
                                                ]);
                                            })
                                            .catch(() => setAllMlModelVersions([]));

                                    }}
                                />
                            }
                        </InputGroup>
                        <InputGroup className='mt-1 position-relative'>
                            <p className='bold-text fs-5'>Version</p>
                            {
                                <Select
                                    initialValue={FormData.benchmarkMlModelVersion}
                                    options={allMlModelVersions}
                                    onChange={(v) => {
                                        setFormData({
                                            ...formData,
                                            benchmarkMlModelVersion: v
                                        });
                                    }}
                                />
                            }
                        </InputGroup>
                    </div>
                    <div style={{display: (showDataset ? 'block' : 'none')}}>
                        <InputGroup className='mt-1 position-relative'>
                            <p className='bold-text fs-5'>Benchmark Model</p>
                            {
                                <Select
                                    initialValue={formData.benchmarkModel}
                                    options={allModelNames}
                                    onChange={(n) => {
                                        setbenchmarkModel(n);

                                        metricsClient('model-versions-for-model', { // Only needs to be called when the chosen ml-model changes
                                            model_id: n
                                        })
                                            .then((data) => {
                                                setAllMlModelVersions([
                                                    ...data.map((v) => ({name: v.model_version, value: v.model_version}))
                                                ]);
                                            })
                                            .catch(() => setAllMlModelVersions([]));

                                    }}
                                />
                            }
                        </InputGroup>
                        <InputGroup className='mt-1 position-relative'>
                            <p className='bold-text fs-5'>Version</p>
                            {
                                <Select
                                    initialValue={FormData.benchmarkMlModelVersion}
                                    options={allMlModelVersions}
                                    onChange={(v) => {
                                        setFormData({
                                            ...formData,
                                            benchmarkMlModelVersion: v
                                        });
                                        metricsClient('dataset-ids', { // Only needs to be called when the chosen ml-model changes
                                            model_id: benchmarkModel,
                                            model_version: v
                                        })
                                            .then((data) => {
                                                setAllDatasetIds([
                                                    ...data.map((v) => ({name: v.dataset_id, value: v.dataset_id}))
                                                ]);
                                            })
                                            .catch(() => setAllDatasetIds([]));

                                    }}
                                />
                            }
                        </InputGroup>
                        <InputGroup className='mt-1 position-relative'>
                            <p className='bold-text fs-5'>Dataset</p>
                            {
                                <Select
                                    initialValue={datasetId}
                                    options={allDatasetIds}
                                    onChange={(id) => {
                                        setDatasetId(id);
                                    }}
                                />
                            }
                        </InputGroup>
                    </div>
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        onClick={() => clearBenchmarkData()}
                        variant='primary'
                    >
                        Clear Benchmark
                    </Button>
                    <Button
                        className='w-100 text-white btn-submit mt-1'
                        variant='primary' type='submit'
                    >
                        {Object.keys(initialValue).length ? 'Update Model' : 'Create Model'}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

ModelForm.propTypes = {
    errors: PropTypes.array,
    initialValue: PropTypes.object,
    onSubmit: PropTypes.func
};

export default setupComponent(ModelForm);
