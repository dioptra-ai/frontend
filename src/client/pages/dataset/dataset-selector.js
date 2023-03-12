import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import {FiExternalLink} from 'react-icons/fi';

import LoadingForm from 'components/loading-form';
import Async from 'components/async';
import Modal from 'components/modal';
import Select from 'components/select';
import baseJSONClient from 'clients/base-json-client';

const NO_ID = '';

const DatasetSelector = ({as = 'a', title = 'Select Dataset', onChange, defaultValue, children = 'Select dataset', allowNew, ...rest}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(defaultValue);
    const handleSubmit = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        let datasetId = event.target.datasetId.value;

        if (!datasetId) {
            const response = await baseJSONClient.post('/api/dataset', {
                displayName: event.target.displayName.value
            });

            datasetId = response['uuid'];
        }
        onChange(datasetId);
        setModalOpen(false);
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
                                <Select name='datasetId' defaultValue={datasets[0]?.['uuid'] || selectedDataset} onChange={(value) => {
                                    setSelectedDataset(value);
                                }}>
                                    {datasets.map((dataset) => (
                                        <option key={dataset['uuid']} value={dataset['uuid']}>
                                            {dataset['display_name']}
                                        </option>
                                    ))}
                                    {
                                        allowNew && (
                                            <option value={NO_ID}>{'<new dataset>'}</option>
                                        )
                                    }
                                </Select>
                                {
                                    selectedDataset && (
                                        <a href={`/dataset/${selectedDataset}`} target='_blank' rel='noopener noreferrer' className='fs-6'>
                                            {datasets.find((d) => d['uuid'] === selectedDataset)['display_name']}<FiExternalLink />
                                        </a>
                                    )
                                }
                            </Form.Group>
                            {selectedDataset ? null : (
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

DatasetSelector.propTypes = {
    as: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    allowNew: PropTypes.bool
};

export default DatasetSelector;
