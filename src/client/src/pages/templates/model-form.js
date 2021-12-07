import React, {useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';

const ModelForm = ({initialValue, onSubmit, errors}) => {
    const [formData, setFormData] = useState({
        name: '',
        mlModelId: '',
        description: '',
        mlModelType: '',
        referencePeriod: {
            start: moment(0),
            end: moment()
        },
        ...initialValue
    });

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
                <p className='text-dark bold-text fs-3 mb-4'>
                    {Object.keys(initialValue).length ? 'Update' : 'Create New'} Model
                </p>
                {errors?.length ? errors.map((e, i) => (
                    <div key={i} className='bg-warning text-white p-3 mt-2'>{e}</div>
                )) : null}
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <InputGroup className='mt-3 text-center'>
                        <Form.Label>Benchmark Date Range</Form.Label>
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
                    <Form.Label className='mt-3 mb-0'>Model ID</Form.Label>
                    <InputGroup className='mt-1'>
                        <Form.Control
                            className={'bg-light'}
                            name='mlModelId'
                            onChange={handleChange}
                            placeholder='Enter Model ID'
                            type='text'
                            value={formData.mlModelId}
                            required
                        />
                    </InputGroup>
                    <Form.Label className='mt-3 mb-0'>Name</Form.Label>
                    <InputGroup className='mt-1'>
                        <Form.Control
                            className={'bg-light'}
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
                            className={'form-control bg-light textarea'}
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
                            className={'form-select bg-light'}
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

ModelForm.propTypes = {
    errors: PropTypes.array,
    initialValue: PropTypes.object,
    onSubmit: PropTypes.func
};

export default setupComponent(ModelForm);
