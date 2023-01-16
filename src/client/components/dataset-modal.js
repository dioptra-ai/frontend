import PropTypes from 'prop-types';
import {Button, Form} from 'react-bootstrap';

import Modal from 'components/modal';
import baseJSONClient from 'clients/base-json-client';

const DatasetEditModal = ({isOpen, onDatasetSaved, onClose, dataset}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dataset ? 'Edit Dataset' : 'Create Dataset'}>
            <Form onSubmit={async (e) => {
                e.preventDefault();
                const savedDataset = await baseJSONClient('/api/dataset', {
                    method: 'POST',
                    body: {
                        displayName: e.target['displayName'].value,
                        uuid: dataset?.uuid
                    }
                });

                onDatasetSaved(savedDataset);
            }}>
                <Form.Label>Dataset Name</Form.Label>
                <Form.Control required type='text' defaultValue={dataset?.['display_name']} name='displayName' placeholder='Dataset name...' />
                <Button
                    className='w-100 text-white btn-submit mt-3'
                    variant='primary'
                    type='submit'
                >
                    {dataset ? 'Update Dataset' : 'Create Dataset'}
                </Button>
            </Form>
        </Modal>
    );
};

DatasetEditModal.propTypes = {
    dataset: PropTypes.object,
    isOpen: PropTypes.any,
    onClose: PropTypes.any,
    onDatasetSaved: PropTypes.func
};

const DatasetCommitModal = ({isOpen, onClose, onCommit, datasetId}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Commit Dataset Version'>
            <Form onSubmit={async (e) => {
                e.preventDefault();

                await baseJSONClient(`/api/dataset/${datasetId}/commit`, {
                    method: 'POST',
                    body: {
                        message: e.target.message.value
                    }
                });

                onCommit();
            }}>
                <Form.Label>Commit Message</Form.Label>
                <Form.Text name='message' className='form-control' as='textarea' rows={3} placeholder='Commit message...' />
                <Button className='w-100 text-white btn-submit mt-3' variant='primary' type='submit'>
                    Commit
                </Button>
            </Form>
        </Modal>
    );
};

DatasetCommitModal.propTypes = {
    datasetId: PropTypes.string,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onCommit: PropTypes.func
};


export {DatasetEditModal, DatasetCommitModal};
