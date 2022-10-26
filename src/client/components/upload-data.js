import baseJSONClient from 'clients/base-json-client';
import PropTypes from 'prop-types';
import {Button, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';

const UploadData = ({onDone}) => {
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const formData = new FormData(event.target);

            await baseJSONClient('/api/ingestion/ingest', {
                method: 'POST',
                body: {
                    urls: [formData.get('url')]
                },
                memoized: false
            });
            onDone();
            alert('Data upload submitted.');
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className='model-form'>
            <Container className='mt-5'>
                <Row>
                    <Col>
                        <Form.Label className='mt-3 mb-0'>Data Source</Form.Label>
                        <InputGroup className='mt-1'>
                            <Form.Control
                                name='url'
                                placeholder='https://signed-url/big-data.ndjson'
                                type='text'
                            />
                        </InputGroup>
                        <Form.Text className='text-muted'>
                            <div>Supported services and protocols: <a target='_blank' href='https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html' rel='noreferrer'>AWS S3</a>, <a target='_blank' href='https://cloud.google.com/storage/docs/access-control/signed-urls' rel='noreferrer'>Google Storage</a>, <a target='_blank' href='https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature' rel='noreferrer'>Azure Storage</a>, [ssh|scp|sftp].</div>
                        </Form.Text>
                        <Form.Label className='mt-3 mb-0'>Python Mapper Module</Form.Label>
                        <InputGroup className='mt-1'>
                            {/* See here to implement this: https://github.com/getredash/redash/blob/master/redash/query_runner/python.py */}
                            <Form.Control
                                name='mapperLocation'
                                placeholder='https://github.com/.../my-model.py'
                                type='text'
                            />
                        </InputGroup>
                        <Form.Text className='text-muted'>
                            <div>Transform and return data into one of the supported formats. See the <a target='_blank' href='/documentation/data_mapping'>Data Mapping Documentation</a>.</div>
                            <div>Allowed external imports: pandas, numpy.</div>
                        </Form.Text>
                    </Col>
                </Row>
                <Row className='mt-3'>
                    <Col>
                        <Button className='btn btn-primary text-white w-100 px-5 py-3' type='submit'>Upload Data</Button>
                    </Col>
                </Row>
            </Container></Form>
    );
};

export default UploadData;

UploadData.propTypes = {
    onDone: PropTypes.func.isRequired
};
