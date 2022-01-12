import React, {useEffect, useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import stores from 'state/stores';
import moment from 'moment';
import PropTypes from 'prop-types';
// import {useParams} from 'react-router-dom';
import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import Select from '../../components/select';


const BenchmarkForm = ({initialValue, onSubmit, errors}) => {
    const [formData, setFormData] = useState({
        mlModelId: '',
        mlModelVersion: '',
        referencePeriod: {
            start: moment(0),
            end: moment()
        },
        ...initialValue
    });
    // const {filtersStore, timeStore, modelStore} = stores;
    const {modelStore} = stores;
    // const {_id} = useParams()._id;
    // console.log('params id:');
    // console.log(useParams()._id);

    const {mlModelId} = modelStore.getModelById('61dcd51194607d3a5b7d78e4'); // Should use _id - need to see why useParams() isn't working

    const [allMlModelVersions, setAllMlModelVersions] = useState([]);
    const [allModelNames, setAllModelNames] = useState([]);

    useEffect(() => {
        baseJsonClient('/api/ml-model') // Only needs to be called on load
            .then((res) => {
                setAllModelNames([
                    ...res.map((model) => ({name: model.mlModelId, value: model.mlModelId}))
                ]);
            });

        metricsClient('model-versions-for-model', {
            model_id: mlModelId
        })
            .then((data) => {
                console.log('data: ');
                console.log(`data: ${data}`);
                setAllMlModelVersions([
                    ...data.map((v) => ({name: v.model_version, value: v.model_version}))
                ]);
            })
            .catch(() => setAllMlModelVersions([]));
    }, [mlModelId]);

    const handleChange = (event) => {
        console.log('event: ');
        console.log(event);
        setFormData({...formData, [event.target.name]: event.target.value});
    };

    // const handleNameChange = (event) => setFormData({...formData, [event.target.name]: event.target.value});

    const onDateChange = ({start, end}) => setFormData({
        ...formData,
        referencePeriod: {start: start.toISOString(), end: end.toISOString()}
    });

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
                    <Form.Label className='mt-3 mb-0'>Select benchmark type</Form.Label>
                    <InputGroup className='mt-1'>
                        <label className='border border-1 px-4 py-3 rounded-3 me-3'>
                            <input
                                type='radio'
                                value='offlineDataset'
                                name='rad'
                                disabled
                            />
                            Dataset
                        </label>
                        <label className='border border-1 px-4 py-3 rounded-3 me-3'>
                            <input
                                type='radio'
                                value='referenceTimeframe'
                                name='rad'
                                checked
                            />
                            Timeframe
                        </label>
                    </InputGroup>
                    <InputGroup className='mt-1 position-relative'>
                        <p className='bold-text fs-5'>Model Name</p>
                        {
                            <Select
                                initialValue='pick'
                                options={allModelNames}
                                onChange={(n) => {
                                    console.log(`model selected: ${n}`);
                                    setFormData({...formData, mlModelId: n});
                                    console.log(`form data post-change: ${formData.mlModelVersion}`);
                                }}
                            />
                        }
                    </InputGroup>
                    <InputGroup className='mt-1 position-relative'>
                        <p className='bold-text fs-5'>Version</p>
                        {
                            <Select
                                initialValue='pick'
                                options={allMlModelVersions}
                                onChange={handleChange}
                            />
                        }
                    </InputGroup>
                    <InputGroup className='mt-3 text-center'>
                        <Form.Label className='mt-3 mb-0'>Benchmark Date Range</Form.Label>
                        <DateTimeRangePicker
                            classNames='justify-content-around bg-light'
                            datePickerSettings={{
                                opens: 'center'
                            }}
                            end={moment(formData?.referencePeriod?.end)}
                            onChange={onDateChange}
                            start={moment(formData?.referencePeriod?.start)}
                            width='100%'
                        />
                    </InputGroup>
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        variant='primary' type='submit'
                    >
                        {/* {Object.keys(initialValue).length ? 'Update Model' : 'Create Model'} */}
                        ADD BENCHMARK
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

BenchmarkForm.propTypes = {
    errors: PropTypes.array,
    initialValue: PropTypes.object,
    onSubmit: PropTypes.func,
    mlModelVersion: PropTypes.string,
    mlModelId: PropTypes.string
};

export default setupComponent(BenchmarkForm);
