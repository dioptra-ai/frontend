import {useFormik} from 'formik';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Button, Form, InputGroup} from 'react-bootstrap';
export default function AwsS3Integration({formData, handleSubmit}) {
    const formik = useFormik({
        initialValues: {
            aws_access_key_id: '',
            aws_secret_access_key: '',
            aws_session_token: ''
        },
        onSubmit: (values) => {
            handleSubmit({aws: values});
        }
    });

    useEffect(() => {
        if (formData && formData.aws) {
            formik.resetForm();
            formik.setValues(formData.aws);
        }
    }, [formData]);

    return (
        <>
            <Form
                autoComplete='off'
                className='w-100'
                onSubmit={formik.handleSubmit}
            >
                <Form.Group className='mb-1'>
                    <Form.Label className='mt-3'>Access Key ID</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className='bg-light'
                            name='aws_access_key_id'
                            onChange={formik.handleChange}
                            type='text'
                            value={formik.values.aws_access_key_id}
                        />
                    </InputGroup>
                    <Form.Label className='mt-3'>Secret Access Key</Form.Label>
                    <InputGroup>
                        <Form.Control
                            className='bg-light'
                            name='aws_secret_access_key'
                            onChange={formik.handleChange}
                            type='text'
                            value={formik.values.aws_secret_access_key}
                        />
                    </InputGroup>
                    <Form.Label className='mt-3'>
                        Session Token <span className='text-muted'>(optional)</span>
                    </Form.Label>
                    <InputGroup>
                        <Form.Control
                            className='bg-light'
                            name='aws_session_token'
                            onChange={formik.handleChange}
                            type='text'
                            value={formik.values.aws_session_token}
                        />
                    </InputGroup>
                </Form.Group>
                <Button
                    className='w-100 text-white bold-text mt-3'
                    disabled={
                        !formik.values.aws_access_key_id ||
                        !formik.values.aws_secret_access_key
                    }
                    type='submit'
                    variant='primary'
                >
                    Save
                </Button>
            </Form>
        </>
    );
}

AwsS3Integration.propTypes = {
    formData: PropTypes.object,
    handleSubmit: PropTypes.func
};
