import {useFormik} from 'formik';
import React, {useEffect} from 'react';
import {Button, InputGroup} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

export default function RedashIntegration({formData, handleSubmit}) {
    const formik = useFormik({
        initialValues: {
            apiKey: '',
            endpoint: ''
        },
        onSubmit: (values) => {
            handleSubmit(values);
        }
    });

    useEffect(() => {
        if (formData) {
            formik.resetForm();
            formik.setValues(formData);
        }
    }, [formData]);

    return (
        <>
            <caption>
                In your Redash backend query please use the following parameters to
                filter the data:
                <ul>
                    <li>"time_start": UTC_TIME</li>
                    <li>"time_end": UTC_TIME</li>
                </ul>
            </caption>
            <Form
                autoComplete='off'
                className='w-100'
                onSubmit={formik.handleSubmit}
            >
                <Form.Group className='mb-3'>
                    <Form.Label>API Key</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className='bg-light'
                            name='apiKey'
                            onChange={formik.handleChange}
                            type='text'
                            value={formik.values.apiKey}
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Redash Endpoint</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className='bg-light'
                            name='endpoint'
                            onChange={formik.handleChange}
                            type='text'
                            value={formik.values.endpoint}
                        />
                    </InputGroup>
                </Form.Group>
                <Button
                    className='w-100 text-white bold-text mt-3'
                    type='submit'
                    variant='primary'
                >
                    Save
                </Button>
            </Form>
        </>
    );
}

RedashIntegration.propTypes = {
    formData: PropTypes.object,
    handleSubmit: PropTypes.func
};
