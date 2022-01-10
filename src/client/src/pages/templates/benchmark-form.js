import React, {useEffect, useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';
import metricsClient from 'clients/metrics';
import Select from '../../components/select';


const BenchmarkForm = ({initialValue, onSubmit, errors, mlModelId}) => {
    const [formData, setFormData] = useState({
        benchmarkType: '',
        mlModelVersion: '',
        referencePeriod: {
            start: moment(0),
            end: moment()
        },
        ...initialValue
    });
    const [allMlModelVersions, setAllMlModelVersions] = useState([]);


    useEffect(() => {
        console.log('Getting all model versions');
        metricsClient('queries/all-ml-model-versions', {
            ml_model_id: mlModelId
        })
            .then((data) => {
                console.log(`data: ${data}`);
                setAllMlModelVersions([
                    ...data.map((v) => ({name: v.mlModelVersion, value: v.mlModelVersion}))
                ]);
            })
            .catch(() => setAllMlModelVersions([]));
    }, [mlModelId]);

    const handleChange = (event) => setFormData({...formData, [event.target.name]: event.target.value});

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
                        <label>
                            <input
                                type='radio'
                                value='offlineDataset'
                            />
                            Offline testing dataset
                        </label>
                        <label>
                            <input
                                type='radio'
                                value='referenceTimeframe'
                            />
                            Reference timeframe
                        </label>
                    </InputGroup>
                    <InputGroup className='mt-1 position-relative'>
                        <p className='bold-text fs-5'>Version</p>
                        {
                            <Select
                                initialValue='CLICK HERE TO CHANGE VERSION'
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
                        {Object.keys(initialValue).length ? 'Update Model' : 'Create Model'}
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
    mlModelId: PropTypes.string
};

export default setupComponent(BenchmarkForm);
