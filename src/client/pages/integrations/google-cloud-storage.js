import {useFormik} from 'formik';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Button, Form} from 'react-bootstrap';

export default function GoogleCloudStorageIntegration({formData, handleSubmit}) {
    const formik = useFormik({
        initialValues: {
            credentials_json: ''
        },
        onSubmit: (values) => {
            handleSubmit({google_cloud_storage: values});
        }
    });

    useEffect(() => {
        if (formData && formData.google_cloud_storage) {
            formik.resetForm();
            formik.setValues(formData.google_cloud_storage);
        }
    }, [formData]);

    return (
        <>
            <Form
                autoComplete='off'
                className='w-100'
                onSubmit={formik.handleSubmit}
            >
                <Form.Group className='mb-3'>
                    <Form.Label className='mt-3'>
                        Google application credentials JSON:
                    </Form.Label>
                    <Form.Control
                        className='bg-light'
                        name='credentials_json'
                        onChange={formik.handleChange}
                        type='text'
                        as='textarea'
                        rows={20}
                        value={formik.values.credentials_json}
                    />
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

GoogleCloudStorageIntegration.propTypes = {
    formData: PropTypes.object,
    handleSubmit: PropTypes.func
};
