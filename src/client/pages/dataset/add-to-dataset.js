import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

import LoadingForm from 'components/loading-form';
import Async from 'components/async';
import Modal from 'components/modal';
import Select from 'components/select';
import baseJSONClient from 'clients/base-json-client';

const AddToDataset = ({as = 'a', title = 'Add to dataset', datapointIds, children, onAddedToDataset, ...rest}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [newDatasetSelected, setNewDatasetSelected] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        let datasetId = event.target.datasetId.value;

        if (datasetId === '') {
            const response = await baseJSONClient.post('/api/dataset', {
                displayName: event.target.displayName.value
            });

            datasetId = response['uuid'];
        }

        await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds});
        setModalOpen(false);
        onAddedToDataset?.(datasetId);
    };

    return (
        <>
            {
                React.createElement(as, {
                    ...rest,
                    onClick: () => {
                        setModalOpen(true);
                        rest.onClick?.();
                    }
                }, children)
            }
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={title}>
                <Async
                    fetchData={() => baseJSONClient('/api/dataset')}
                    renderData={(datasets) => (
                        <LoadingForm onSubmit={handleSubmit}>
                            <Form.Group className='mb-3'>
                                <Form.Label>Dataset</Form.Label>
                                <Select name='datasetId' onChange={(value) => {
                                    setNewDatasetSelected(value === '');
                                }}>
                                    {datasets.map((dataset) => (
                                        <option key={dataset['uuid']} value={dataset['uuid']}>
                                            {dataset['display_name']}
                                        </option>
                                    ))}
                                    <option value=''>{'<new dataset>'}</option>
                                </Select>
                            </Form.Group>
                            {newDatasetSelected && (
                                <Form.Group className='mb-3'>
                                    <Form.Label>New Dataset Name</Form.Label>
                                    <Form.Control type='text' name='displayName' required/>
                                </Form.Group>
                            )}
                            <LoadingForm.Error/>
                            <LoadingForm.Button variant='primary' type='submit' className='text-white w-100'>
                                Submit
                            </LoadingForm.Button>
                        </LoadingForm>
                    )}
                />
            </Modal>
        </>
    );
};

AddToDataset.propTypes = {
    as: PropTypes.string,
    title: PropTypes.string,
    datapointIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node.isRequired,
    onAddedToDataset: PropTypes.func
};

export default AddToDataset;
