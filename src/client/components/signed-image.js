import metricsClient from 'clients/metrics';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import {useHistory} from 'react-router-dom';

const SignedImage = ({rawUrl, setSignedUrlCallback}) => {
    const [signedUrl, setSignedUrl] = useState(rawUrl);

    const [awsS3IntegrationNotSet, setAwsS3IntegrationNotSet] = useState(false);
    const [gcpIntegrationNotSet, setGcpIntegrationNotSet] = useState(false);

    const history = useHistory();

    useEffect(() => {
        fetchSignedImage();
    }, [rawUrl]);

    const fetchSignedImage = async () => {
        const signedUrl = await metricsClient('/signed-url', {
            url: rawUrl
        });

        setSignedUrlCallback(signedUrl[0]);
        setSignedUrl(signedUrl[0]);
    };

    const handleLoadError = () => {
        if (rawUrl.includes('amazon')) {
            setAwsS3IntegrationNotSet(true);
        } else if (rawUrl.includes('google')) {
            setGcpIntegrationNotSet(true);
        }
    };

    const handleLoad = () => {
        if (rawUrl.includes('amazon')) {
            setAwsS3IntegrationNotSet(false);
        } else if (rawUrl.includes('google')) {
            setGcpIntegrationNotSet(false);
        }
    };

    return (
        <div>
            <img
                alt='Example'
                className='rounded'
                src={signedUrl}
                height={200}
                onLoad={handleLoad}
                onError={handleLoadError}
            />
            {(awsS3IntegrationNotSet || gcpIntegrationNotSet) && (
                <div className='d-flex flex-column p-3' style={{gap: 10}}>
                    <span>
                        {awsS3IntegrationNotSet ?
                            'AWS S3 storage integration is not set' :
                            'Google Cloud storage integration is not set'}
                    </span>
                    <Button
                        className='bold-text fs-6'
                        variant='outline-secondary'
                        onClick={() => {
                            history.push({
                                pathname: '/settings',
                                state: {
                                    integration: awsS3IntegrationNotSet ?
                                        'aws_s3' :
                                        'google_cloud_storage',
                                    backPath: location.href
                                }
                            });
                        }}
                    >
                        GO TO SETTINGS
                    </Button>
                </div>
            )}
        </div>
    );
};

SignedImage.propTypes = {
    rawUrl: PropTypes.string,
    setSignedUrlCallback: PropTypes.func
};

export default SignedImage;
