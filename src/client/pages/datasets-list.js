import {useState} from 'react';
import Table from 'react-bootstrap/Table';
import {Button, Container, Form, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {AiOutlineDelete} from 'react-icons/ai';

import Async from 'components/async';
import GeneralSearchBar from 'pages/common/general-search-bar';
import baseJsonClient from 'clients/base-json-client';
import Menu from 'components/menu';
import ModalComponent from 'components/modal';

const DatasetsList = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput/>
            <div className='p-4 mt-5'>
                <div className='d-flex justify-content-between'>
                    <span className='h2 fs-1 text-dark bold-text'>Datasets</span>
                    <Button
                        className='py-3 fs-6 bold-text px-5 text-white'
                        onClick={() => setShowModal(true)}
                        variant='primary'
                    >
                        CREATE NEW DATASET
                    </Button>
                </div>
                <Async
                    fetchData={() => baseJsonClient('api/dataset', {method: 'get'})}
                    renderData={(datasets) => (
                        <Table className='models-table mt-3'>
                            <thead className='align-middle text-secondary'>
                                <tr className='border-0 border-bottom border-mercury'>
                                    <th className='text-secondary'>Dataset ID</th>
                                    <th className='text-secondary'>Dataset Name</th>
                                    <th className='text-secondary'>Size</th>
                                    <th className='text-secondary'>Created At</th>
                                    <th className='text-secondary d-flex justify-content-end'>
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {datasets.map(({_id, name, createdAt}, i) => (
                                    <tr className='cursor-pointer' key={i}>
                                        <td>{_id}</td>
                                        <td>{name}</td>
                                        <td>N/A</td>
                                        <td>{new Date(createdAt).toLocaleString()}</td>
                                        <td>
                                            <div className='d-flex justify-content-center align-content-center align-items-center'>
                                                <OverlayTrigger overlay={
                                                    <Tooltip>Delete this dataset</Tooltip>
                                                }>
                                                    <AiOutlineDelete
                                                        className='fs-3 cursor-pointer'
                                                        onClick={async () => {
                                                            await baseJsonClient(`api/dataset/${_id}`, {
                                                                method: 'delete'
                                                            });
                                                            window.location.reload();
                                                        }}
                                                    />
                                                </OverlayTrigger>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                />
                <ModalComponent isOpen={showModal} onClose={() => setShowModal(false)} title='Create New Dataset'>
                    <Container
                        className='model fs-6 d-flex align-items-center justify-content-center'
                        fluid
                    >
                        <Form autoComplete='off' className='w-100' enctype='multipart/form-data' method='post' action='api/dataset'>
                            <Form.Label className='mt-3 mb-0'>Name</Form.Label>

                            <InputGroup className='mt-1'>
                                <Form.Control name='name' required/>
                            </InputGroup>
                            <Form.Label className='mt-3 mb-0'>File</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control name='file' type='file' required/>
                            </InputGroup>
                            <Button
                                className='w-100 text-white btn-submit mt-3'
                                variant='primary' type='submit'
                            >
                                Create Dataset
                            </Button>
                        </Form>
                    </Container>
                </ModalComponent>
            </div>
        </Menu>
    );
};

export default DatasetsList;
