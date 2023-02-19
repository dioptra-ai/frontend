import {Form} from 'react-bootstrap';

import LoadingForm from 'components/loading-form';
import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';

export default function GoogleCloudStorageIntegration() {

    return (
        <Async fetchData={() => baseJSONClient('/api/integration/GOOGLE_CLOUD_STORAGE')}
            renderData={({data}) => (
                <LoadingForm
                    autoComplete='off'
                    className='w-100'
                    onSubmit={(e, google_cloud_storage) => {
                        e.preventDefault();

                        const payload = {data: {google_cloud_storage}, type: 'GOOGLE_CLOUD_STORAGE'};

                        return baseJSONClient('/api/integration', {
                            method: 'POST',
                            body: payload
                        });
                    }}
                >
                    <h4>Google Cloud Storage</h4>
                    <Form.Group className='mb-3'>
                        <Form.Label className='mt-3'>
                            Google application credentials JSON:
                        </Form.Label>
                        <Form.Control
                            className='bg-light'
                            name='credentials_json'
                            type='text'
                            as='textarea'
                            rows={20}
                            defaultValue={data?.['google_cloud_storage']?.['credentials_json'] || ''}
                        />
                    </Form.Group>
                    <div className='w-100 mt-3'>
                        <LoadingForm.Error />
                        <LoadingForm.Success>{({message}) => message}</LoadingForm.Success>
                        <LoadingForm.Button
                            className='text-white bold-text w-100'
                            type='submit'
                            variant='primary'
                        >
                            Save
                        </LoadingForm.Button>
                    </div>
                </LoadingForm>
            )}
        />
    );
}
