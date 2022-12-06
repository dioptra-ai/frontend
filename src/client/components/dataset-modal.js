import PropTypes from 'prop-types';
import {useState} from 'react';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';

import Modal from 'components/modal';
import baseJSONClient from 'clients/base-json-client';
import DataSelector from './data-selector';

const DatasetModal = ({isOpen, onDatasetSaved, onClose, datapoints, dataset}) => {
    const [displayName, setDisplayName] = useState(dataset ? dataset.displayName : '');
    const [selectData, setSelectData] = useState(datapoints ? {
        filters: [{
            left: 'request_id',
            op: 'in',
            right: datapoints.map(({request_id}) => request_id)
        }]
    } : null);
    const handleSaveDataset = () => {
        baseJSONClient('/api/datasets', {
            method: 'POST',
            body: {
                displayName,
                id: dataset?.id
            }
        });
        // TODO: add datapoints if datapoints are provided
        onDatasetSaved();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={dataset ? 'Edit Dataset' : 'Create Dataset'}>
            <Form onSubmit={(e) => {
                e.preventDefault();
                handleSaveDataset();
            }}>
                <Container fluid>
                    <Row>
                        <Col>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type='text' placeholder='Name' value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Label>Data Points</Form.Label>
                            <DataSelector value={selectData} onChange={setSelectData} emptyOnUnfiltered />
                        </Col>
                    </Row>
                </Container>
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
    datapoints: PropTypes.shape({
        map: PropTypes.func
    }),
    dataset: PropTypes.shape({
        displayName: PropTypes.any,
        id: PropTypes.any
    }),
    isOpen: PropTypes.any,
    onClose: PropTypes.any,
    onDatasetSaved: PropTypes.func
};

export default DatasetModal;
