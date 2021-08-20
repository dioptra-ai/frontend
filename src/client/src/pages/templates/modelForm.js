import React, {useEffect, useState} from 'react';
import {Button, Container, Form, InputGroup} from 'react-bootstrap';
import moment from 'moment';
import PropTypes from 'prop-types';
import Tooltip from '../../components/tooltip';

import FontIcon from '../../components/font-icon';
import {IconNames} from '../../constants';
import DateTimeRangePicker from '../../components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';

const ModelForm = ({modelStore, initialValue, onSubmit}) => {
    const [formData, setFormData] = useState({
        name: '',
        mlModelId: '',
        description: '',
        mlModelType: '',
        referencePeriod: {
            start: moment(),
            end: moment()
        }
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => setFormData({...formData, [event.target.name]: event.target.value});

    const onDateChange = ({start, end}) => setFormData({
        ...formData,
        referencePeriod: {start: start.toISOString(), end: end.toISOString()}
    });

    const handleSubmit = () => {
        onSubmit(formData);
    };

    useEffect(() => {
        setFormData({...formData, ...initialValue});
    }, [initialValue]);

    useEffect(() => {
        const errObj = JSON.parse(modelStore.error);

        setErrors({...errors, ...errObj?.err});
    }, [modelStore.error]);

    return (
        <Container
            className='model fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='model-form d-flex flex-column align-items-center'>
                <p className='text-dark bold-text fs-3 mb-4'>Create New Model</p>
                <Form autoComplete='off' className='w-100'>
                    <InputGroup className='mt-3 text-center'>
                        <DateTimeRangePicker
                            end={moment(formData?.referencePeriod?.end)}
                            onChange={onDateChange}
                            settings={{
                                bgColorClass: 'bg-light',
                                width: '100%',
                                classNames: 'justify-content-around',
                                datePicker: {
                                    opens: 'center'
                                }
                            }}
                            start={moment(formData?.referencePeriod?.start)}
                        />
                    </InputGroup>
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${
                                errors.mlModelId ? 'error' : ''
                            }`}
                            name='mlModelId'
                            onChange={handleChange}
                            placeholder='Enter Model ID'
                            type='text'
                            value={formData.mlModelId}
                        />
                        {errors.mlModelId && (
                            <FontIcon
                                className='text-warning error-icon'
                                icon={IconNames.WARNING}
                                size={20}
                            />
                        )}
                    </InputGroup>
                    {errors.mlModelId && (
                        <Tooltip className='p-3 mt-2' color='warning' text={errors.mlModelId} />
                    )}
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${errors.name ? 'error' : ''}`}
                            name='name'
                            onChange={handleChange}
                            placeholder='Enter Model ID'
                            type='text'
                            value={formData.name}
                        />
                        {errors.name && (
                            <FontIcon
                                className='text-warning error-icon'
                                icon={IconNames.WARNING}
                                size={20}
                            />
                        )}
                    </InputGroup>
                    {errors.name && (
                        <Tooltip className='p-3 mt-2' color='warning' text={errors.name} />
                    )}
                    <InputGroup className='mt-3'>
                        <textarea
                            className={`form-control bg-light text-secondary textarea ${
                                errors.description ? 'error' : ''
                            }`}
                            name='description'
                            onChange={handleChange}
                            placeholder='Enter Model Description'
                            rows={3}
                            type='textarea'
                            value={formData.description}
                        />
                        {errors.description && (
                            <FontIcon
                                className='text-warning error-icon'
                                icon={IconNames.WARNING}
                                size={20}
                            />
                        )}
                    </InputGroup>
                    {errors.description && (
                        <Tooltip
                            className='p-3 mt-2'
                            color='warning'
                            text={errors.description}
                        />
                    )}
                    <InputGroup className='mt-3'>
                        <select
                            className={`form-control bg-light text-secondary ${
                                errors.mlModelType ? 'error' : ''
                            }`}
                            name='mlModelType'
                            onChange={handleChange}
                            value={formData.mlModelType}
                        >
                            <option disabled value=''>
                Select ML Modal Type
                            </option>
                            <option value='IMAGE_CLASSIFIER'>Image Classifier</option>
                            <option value='TABULAR_CLASSIFIER'>Tabular Classifier</option>
                        </select>
                        {errors.mlModelType && (
                            <FontIcon
                                className='text-warning error-icon'
                                icon={IconNames.WARNING}
                                size={20}
                            />
                        )}
                    </InputGroup>
                    {errors.mlModelType && (
                        <Tooltip
                            className='p-3 mt-2'
                            color='warning'
                            text={errors.mlModelType}
                        />
                    )}
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        onClick={handleSubmit}
                        variant='primary'
                    >
            Create Model
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

ModelForm.propTypes = {
    initialValue: PropTypes.object,
    modelStore: PropTypes.object,
    onSubmit: PropTypes.func
};

export default setupComponent(ModelForm);
