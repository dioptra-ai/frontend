import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FontIcon from '../components/font-icon';
import {IconNames} from '../constants';
import baseJSONClient from 'clients/base-json-client';

const Settings = () => {
    const [formData, setFormData] = useState({
        apiKey: '',
        endpoint: ''
    });
    const [isUpdate, setUpdate] = useState(false);
    const [error, setError] = useState(null);

    const isDisabled = !(formData.apiKey && formData.endpoint);

    useEffect(() => {
        baseJSONClient('/api/integration/REDASH')
            .then((res) => {
                setError('');
                if (res) {
                    const {apiKey, endpoint} = res;

                    setUpdate(true);
                    setFormData({apiKey, endpoint});
                }
            })
            .catch(() => {
                setUpdate(false);
                setFormData({apiKey: '', endpoint: ''});
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        baseJSONClient('/api/integration', {
            method: 'POST',
            body: {...formData, type: 'REDASH'}
        })
            .then((res) => {
                setError('');
                setUpdate(Boolean(res));
            })
            .catch((e) => setError(e.message));
    };

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Integrations</p>
                <p className='text-dark bold-text fs-4 m-0'>Redash</p>
                <caption>
                    In your Redash backend query please use the following parameters to filter the data:
                    <ul>
                        <li>"time_start": UTC_TIME</li>
                        <li>"time_end": UTC_TIME</li>
                    </ul>
                </caption>
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>API Key</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${error ? 'error' : ''}`}
                                name='apiKey'
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        apiKey: e.target.value
                                    });
                                    setError(null);
                                }}
                                type='text'
                                value={formData.apiKey}
                            />
                            {error && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Redash Endpoint</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${error ? 'error' : ''}`}
                                name='endpoint'
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        endpoint: e.target.value
                                    });
                                }}
                                type='endpoint'
                                value={formData.endpoint}
                            />
                            {error && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        disabled={isDisabled}
                        type='submit'
                        variant='primary'
                    >
                        {isUpdate ? 'Update' : 'Create'}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

export default Settings;
