import baseJSONClient from 'clients/base-json-client';
import React, {useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {useLocation} from 'react-router-dom';
import {Integrations} from '../enums/integrations';
import AwsS3Integration from './integrations/aws-s3';
import GoogleCloudStorageIntegration from './integrations/google-cloud-storage';

const Settings = () => {
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState('');
    const [selectedIntegration, setSelectedIntegration] = useState(Integrations.AWS_S3.value);
    const [formData, setFormData] = useState();
    const location = useLocation();

    useEffect(() => {
        fetchConfig();
    }, [selectedIntegration]);

    useEffect(() => {
        if (location.state && location.state.integration === 'aws_s3') {
            setSelectedIntegration(Integrations.AWS_S3.value);
        }
        if (
            location.state &&
            location.state.integration === 'google_cloud_storage'
        ) {
            setSelectedIntegration(Integrations.GOOGLE_CLOUD_STORAGE.value);
        }
    }, [location.state]);

    const fetchConfig = () => {
        setFormData(null);
        baseJSONClient(`/api/integration/${selectedIntegration}`)
            .then((res) => {
                setFormData(res.data);
                setSuccessMessage(null);
                setError('');
            })
            .catch((e) => {
                setFormData(null);
                setSuccessMessage(null);
                setError(
                    `An error occurred during configuration fetch. Please try again. Reason: ${e}`
                );
            });
    };

    const handleSubmit = (values) => {
        const payload = {data: values, type: selectedIntegration};

        baseJSONClient('/api/integration', {
            method: 'POST',
            body: payload
        })
            .then(({message}) => {
                setFormData(null);
                setSuccessMessage(message);
                setError('');
                if (
                    location.state &&
                    (location.state.integration === 'aws_s3' ||
                        location.state.integration === 'google_cloud_storage')
                ) {
                    window.location = location.state.backPath;
                }
            })
            .catch((e) => {
                setFormData(null);
                setSuccessMessage(null);
                setError(e.message);
            });
    };

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Integrations</p>
                <Row className='mt-3 align-items-center'>
                    <Col>
                        <Row className='border-bottom px-3'>
                            <div className='d-flex'>
                                {Object.values(Integrations).map(
                                    (integration, index) => {
                                        return (
                                            <span
                                                className={`tab fs-5 ${
                                                    integration.value ===
                                                    selectedIntegration ?
                                                        'active' :
                                                        ''
                                                }`}
                                                key={index}
                                                style={{
                                                    cursor: 'pointer'
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
                {successMessage && (
                    <Alert className='mt-3' variant='success'>
                        {successMessage}
                    </Alert>
                )}
                {error && error !== '' && (
                    <Alert className='mt-3' variant='warning'>
                        {error}
                    </Alert>
                )}
                {selectedIntegration === Integrations.AWS_S3.value && (
                    <AwsS3Integration
                        formData={formData}
                        handleSubmit={handleSubmit}
                    />
                )}
                {selectedIntegration === Integrations.GOOGLE_CLOUD_STORAGE.value && (
                    <GoogleCloudStorageIntegration
                        formData={formData}
                        handleSubmit={handleSubmit}
                    />
                )}
            </div>
        </Container>
    );
};

export default Settings;
