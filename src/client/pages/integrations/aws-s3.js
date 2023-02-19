import {Form, InputGroup} from 'react-bootstrap';

import baseJSONClient from 'clients/base-json-client';
import LoadingForm from 'components/loading-form';
import Async from 'components/async';

export default function AwsS3Integration() {

    return (
        <Async fetchData={() => baseJSONClient('/api/integration/AWS_S3')}
            renderData={({data}) => (
                <LoadingForm
                    autoComplete='new-api-key'
                    className='w-100'
                    onSubmit={async (e, aws) => {
                        e.preventDefault();

                        const payload = {data: {aws}, type: 'AWS_S3'};

                        await baseJSONClient('/api/integration', {
                            method: 'POST',
                            body: payload
                        });
                    }}
                >
                    <Form.Group className='mb-3'>
                        <Form.Label className='mt-3'>Access Key ID</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className='bg-light'
                                name='aws_access_key_id'
                                type='text'
                                defaultValue={data?.['aws']?.['aws_access_key_id'] || ''}
                            />
                        </InputGroup>
                        <Form.Label className='mt-3'>Secret Access Key</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className='bg-light'
                                name='aws_secret_access_key'
                                type='password'
                                defaultValue={data?.['aws']?.['aws_secret_access_key'] || ''}
                            />
                        </InputGroup>
                        <Form.Label className='mt-3'>
                        Session Token <span className='text-muted'>(optional)</span>
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                className='bg-light'
                                name='aws_session_token'
                                type='text'
                                defaultValue={data?.['aws']?.['aws_session_token'] || ''}
                            />
                        </InputGroup>
                    </Form.Group>
                    <div className='w-100 mt-3'>
                        <LoadingForm.Error />
                        <LoadingForm.Success />
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
