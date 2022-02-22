import baseJSONClient from 'clients/base-json-client';
import React, {useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {Integrations} from '../enums/integrations';
import AwsS3Integration from './integrations/aws-s3';
import RedashIntegration from './integrations/redash';

const Settings = () => {
    const [updated, setUpdated] = useState(false);
    const [error, setError] = useState('');
    const [selectedIntegration, setSelectedIntegration] = useState(
        Integrations.REDASH.value
    );
    const [formData, setFormData] = useState();

    useEffect(() => {
        fetchConfig();
    }, [selectedIntegration]);

    const fetchConfig = () => {
        setFormData(null);
        baseJSONClient(`/api/integration/${selectedIntegration}`)
            .then((res) => {
                setFormData(res.data);
                setUpdated(false);
                setError('');
            })
            .catch((e) => {
                setFormData(null);
                console.log(e);
                setUpdated(false);
                setError(
                    'An error occurred during configuration fetch. Please try again.'
                );
            });
    };

    const handleSubmit = (values) => {
        const payload = {data: values, type: selectedIntegration};

        baseJSONClient('/api/integration', {
            method: 'POST',
            body: payload
        })
            .then(() => {
                setFormData(null);
                setUpdated(true);
                setError('');
            })
            .catch(() => {
                setFormData(null);
                setUpdated(false);
                setError(
                    'An error occurred during configuration update. Please try again'
                );
            });
    };

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Integrations</p>
                <Row className='mt-3 align-items-center'>
                    <Col xl={5}>
                        <Row className='border-bottom px-3'>
                            <div className='d-flex'>
                                {Object.values(Integrations).map(
                                    (integration, index) => {
                                        return (
                                            <span
                                                activeClassName='active'
                                                className={`tab fs-5 ${
                                                    integration.value ===
                                                    selectedIntegration ?
                                                        'active' :
                                                        ''
                                                }`}
                                                key={index}
                                                style={{
                                                    cursor: 'pointer',
                                                    minWidth: 70
                                                }}
                                                onClick={() => {
                                                    setSelectedIntegration(
                                                        integration.value
                                                    );
                                                }}
                                            >
                                                {integration.name}
                                                <span className='d-block mt-3 rounded-top'></span>
                                            </span>
                                        );
                                    }
                                )}
                            </div>
                        </Row>
                    </Col>
                </Row>
                <p className='text-dark bold-text fs-4 m-0 mt-4'>
                    {selectedIntegration &&
                        Object.values(Integrations).filter(
                            (integration) => integration.value === selectedIntegration
                        )[0].name}
                </p>
                {updated && (
                    <Alert className='mt-3' variant='success'>
                        Configuration updated successfully
                    </Alert>
                )}
                {error && error !== '' && (
                    <Alert className='mt-3' variant='warning'>
                        {error}
                    </Alert>
                )}

                {selectedIntegration === Integrations.REDASH.value && (
                    <RedashIntegration
                        formData={formData}
                        handleSubmit={handleSubmit}
                    />
                )}
                {selectedIntegration === Integrations.AWS_S3.value && (
                    <AwsS3Integration
                        formData={formData}
                        handleSubmit={handleSubmit}
                    />
                )}
            </div>
        </Container>
    );
};

export default Settings;
