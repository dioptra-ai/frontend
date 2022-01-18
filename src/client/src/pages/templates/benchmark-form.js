import React, {useEffect, useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';
import baseJsonClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';
import Select from '../../components/select';

const BenchmarkForm = ({initialValue, onSubmit, errors}) => {
    const [formData, setFormData] = useState({ // Need to populate formData to update the database when submitting
        mlModelVersion: '',
        mlModelName: '',
        referencePeriod: {
            start: moment(0),
            end: moment()
        },
        ...initialValue
    });

    const [allMlModelVersions, setAllMlModelVersions] = useState([]);
    const [allModelNames, setAllModelNames] = useState([]);

    useEffect(() => {
        baseJsonClient('/api/ml-model') // Only needs to be called on load.  Called once.
            .then((res) => {
                console.log('res: ');
                console.log(res);
                setAllModelNames([
                    ...res.map((model) => ({name: model.mlModelId, value: model.mlModelId}))
                ]);
            });
    }, []);

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
                                    setFormData({...formData, mlModelName: n});

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
                                initialValue='pick'
                                options={allMlModelVersions}
                                onChange={(v) => {
                                    setFormData({...formData, mlModelVersion: v});
                                }}
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
    mlModelName: PropTypes.string,
    referencePeriod: PropTypes.object
};

export default setupComponent(BenchmarkForm);
