import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FontIcon from '../components/font-icon';
import {setupComponent} from '../helpers/component-helper';
import {IconNames} from '../constants';
import baseJSONClient from 'clients/base-json-client';

const Settings = ({authStore}) => {
    const {userData} = authStore;

    const [formData, setFormData] = useState({
        apiKey: '',
        endpoint: ''
    });
    const [isUpdate, setUpdate] = useState(false);
    const [error, setError] = useState(null);

    const isDisabled = !(formData.apiKey && formData.endpoint);

    useEffect(() => {
        baseJSONClient(`/api/integration/${userData.activeOrganizationMembership.organization._id}`)
            .then((res) => {
                setError('');
                console.log('Res: ', res);
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
            body: formData
        })
            .then((res) => {
                setError('');
                setUpdate(Boolean(res));
            })
            .catch(() => setError('Something went wrong! Try again.'));
    };

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Integrations</p>
                <p className='text-dark bold-text fs-4'>Redash</p>
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
                                className={`bg-light ${
                                    error ? 'error' : ''
                                }`}
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

Settings.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Settings);
