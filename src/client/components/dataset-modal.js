import PropTypes from 'prop-types';
import {useState} from 'react';
import {Button, Form} from 'react-bootstrap';

import Modal from 'components/modal';
import baseJSONClient from 'clients/base-json-client';
import metricsClient from 'clients/metrics';

const DatasetModal = ({isOpen, onDatasetSaved, onClose, defaultDatapoints, defaultFilters, dataset}) => {
    const [displayName, setDisplayName] = useState(dataset ? dataset['display_name'] : '');
    const [datapoints, setDatapoints] = useState(defaultDatapoints);
    const handleSaveDataset = async () => {
        const savedDataset = await baseJSONClient('/api/datasets', {
            method: 'POST',
            body: {
                displayName,
                uuid: dataset?.uuid
            }
        });

        if (datapoints?.length) {

            await baseJSONClient(`/api/datasets/${savedDataset.uuid}/datapoints`, {
                method: 'POST',
                body: {
                    requestIds: datapoints.map(({request_id}) => request_id)
                }
            });

        }

        onDatasetSaved(savedDataset);
    };

    useState(() => {
        (async () => {
            if (defaultFilters) {
                if (defaultFilters.length > 0) {
                    const datapoints = await metricsClient('select', {
                        select: 'DISTINCT "request_id"',
                        filters: defaultFilters
                    });

                    setDatapoints(datapoints);
                } else {
                    setDatapoints([]);
                }
            }
        })();
    }, [defaultFilters]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dataset ? 'Edit Dataset' : 'Create Dataset'}>
            <Form onSubmit={(e) => {
                e.preventDefault();
                handleSaveDataset();
            }}>
                <Form.Label>Name</Form.Label>
                <Form.Control required type='text' value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
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

DatasetModal.propTypes = {
    datapoints: PropTypes.array,
    dataset: PropTypes.object,
    isOpen: PropTypes.any,
    onClose: PropTypes.any,
    onDatasetSaved: PropTypes.func,
    defaultDatapoints: PropTypes.array,
    defaultFilters: PropTypes.array
};

export default DatasetModal;
