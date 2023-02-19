import {Container, Tab, Tabs} from 'react-bootstrap';
import AwsS3Integration from './integrations/aws-s3';
import GoogleCloudStorageIntegration from './integrations/google-cloud-storage';

const Settings = () => {

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Settings</p>
                <Tabs className='mt-4' fill>
                    <Tab eventKey='s3' title='AWS S3 Integration'>
                        <AwsS3Integration/>
                    </Tab>
                    <Tab eventKey='gcs' title='Google Cloud Storage Integration'>
                        <GoogleCloudStorageIntegration/>
                    </Tab>
                </Tabs>
            </div>
        </Container>
    );
};

export default Settings;
