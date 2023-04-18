import React from 'react';
import {useHistory} from 'react-router-dom';
import baseJSONClient from 'clients/base-json-client';
import PropTypes from 'prop-types';
import {Button, Col, Form, Row} from 'react-bootstrap';
import Select from './select';
import Spinner from 'components/spinner';

const UploadData = ({onDone}) => {
    const history = useHistory();
    const [isDataSourceLocal, setIsDataSourceLocal] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.target);

            let url = '';

            if (isDataSourceLocal) {
                const response = await fetch('/api/ingestion/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                url = await response.text();
            } else {
                url = formData.get('url');
            }

            const ingestResponse = await baseJSONClient('/api/ingestion/ingest', {
                method: 'POST',
                body: {
                    urls: [url]
                },
                memoized: false
            });

            onDone();
            history.push(`/settings/uploads/${ingestResponse['id'] || ''}`);
        } catch (e) {
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} enctype='multipart/form-data'>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label className='mt-3 mb-0'>Data Source</Form.Label>
                        <Select value={isDataSourceLocal ? 'local' : 'remote'} onChange={(value) => setIsDataSourceLocal(value === 'local')}>
                            <option value='local'>Local File</option>
                            <option value='remote'>Remote URL</option>
                        </Select>
                        <Form.Text muted>
                            Supported format: <a target='_blank' href='http://ndjson.org/libraries.html' rel='noreferrer'>newline-delimited json</a>.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group>
                        {
                            isDataSourceLocal ? (
                                <>
                                    <Form.Label className='mt-3 mb-0'>Local File (.ndjson, .jsonl)</Form.Label>
                                    <Form.File
                                        name='file'
                                        required
                                        className='mt-1'
                                        accept='.json,.ndjson,.jsonl'
                                    />
                                </>
                            ) : (
                                <>
                                    <Form.Label className='mt-3 mb-0'>Public or signed URL</Form.Label>
                                    <Form.Control
                                        name='url'
                                        placeholder='https://signed-url/big-data.ndjson'
                                        type='text'
                                        required
                                    />
                                    <Form.Text muted>
                                        Supported services and protocols: <a target='_blank' href='https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html' rel='noreferrer'>AWS S3</a>, <a target='_blank' href='https://cloud.google.com/storage/docs/access-control/signed-urls' rel='noreferrer'>Google Storage</a>, <a target='_blank' href='https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature' rel='noreferrer'>Azure Storage</a>, [ssh|scp|sftp].
                                    </Form.Text>
                                </>
                            )

                        }
                    </Form.Group>
                </Col>
            </Row>
            <Row className='mt-3'>
                <Col>
                    <Button disabled={isLoading} className='btn btn-primary text-white w-100 p-2' type='submit'>Submit</Button>
                </Col>
            </Row>
            {
                isLoading ? (
                    <Spinner />
                ) : null
            }
        </Form>
    );
};

export default UploadData;

UploadData.propTypes = {
    onDone: PropTypes.func.isRequired
};
