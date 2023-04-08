import metricsClient from 'clients/metrics';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import {useHistory} from 'react-router-dom';

const SignedImage = ({rawUrl, ...rest}) => {
    const [signedUrl, setSignedUrl] = useState(rawUrl);
    const [signedImageRequested, setSignedImageRequested] = useState(false);

    const [awsS3IntegrationNotSet, setAwsS3IntegrationNotSet] = useState(false);
    const [gcpIntegrationNotSet, setGcpIntegrationNotSet] = useState(false);

    const history = useHistory();

    useEffect(() => {
        setSignedUrl(rawUrl);
        setSignedImageRequested(false);
    }, [rawUrl]);

    const handleLoadError = async () => {
        if (!signedImageRequested) {
            try {
                // Wait for more important calls to be made before clogging the browser with
                // this noisy call.
                await new Promise((resolve) => setTimeout(resolve, 100));
                const s = await metricsClient('/signed-url', {
                    url: rawUrl
                });

                setSignedUrl(s);
            } catch (e) {
                if (rawUrl.includes('amazon')) {
                    setAwsS3IntegrationNotSet(true);
                } else if (rawUrl.includes('google')) {
                    setGcpIntegrationNotSet(true);
                }
            } finally {
                setSignedImageRequested(true);
            }
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
                src={signedUrl}
                onLoad={handleLoad}
                onError={handleLoadError}
                {...rest}
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
    rawUrl: PropTypes.string
};

export default SignedImage;
