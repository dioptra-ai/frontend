import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import baseJSONClient from 'clients/base-json-client';
import ModalComponent from 'components/modal';
import {HiPencilAlt} from 'react-icons/hi';

const RowActions = ({row, data, fetchAgain, fetch}) => {
    const [openEditModal, setOpenEditModal] = useState(false);
    const [error, setError] = useState(null);
    const [type, setType] = useState('');

    const {user, type: userAccessType} = data[row.index];

    useEffect(() => {
        setError(null);
        setType('');
    }, [openEditModal]);

    useEffect(() => {
        setType(userAccessType);
    }, [userAccessType, openEditModal]);

    const handleUpdate = () => {
        baseJSONClient(
            `/api/organization-membership/${user.activeOrganizationMembership._id}/member`,
            {
                method: 'put',
                body: {type}
            }
        )
            .then(() => {
                setError(null);
                setOpenEditModal(false);
                fetchAgain(!fetch);
            })
            .catch((e) => setError(e.message));
    };

    const handleDelete = () => {
        baseJSONClient(
            `/api/organization-membership/${user.activeOrganizationMembership._id}`,
            {
                method: 'delete'
            }
        )
            .then(() => {
                setError(null);
                setOpenEditModal(false);
                fetchAgain(!fetch);
            })
            .catch((e) => setError(e.message));
    };

    return (
        <>
            <HiPencilAlt
                className='cursor-pointer'
                style={{fontSize: 20}}
                onClick={() => setOpenEditModal(true)}
            />
            <ModalComponent
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                title={`Edit Member: ${user.username}`}
            >
                <Container
                    className='model fs-6 d-flex align-items-center justify-content-center edit-modal'
                    fluid
                >
                    <div className='model-form d-flex flex-column align-items-center'>
                        {error && (
                            <div className='bg-warning text-white p-3 mt-2'>
                                {error}
                            </div>
                        )}
                        <Form autoComplete='off' className='w-100'>
                            <InputGroup className='mt-1 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>
                                    Membership Type
                                </Form.Label>
                                <Form.Control
                                    as='select'
                                    className={'form-select w-100'}
                                    value={type}
                                    onChange={({target}) => setType(target.value)}
                                    custom
                                    required
                                >
                                    <option disabled value=''>
                                        Select Membership Type
                                    </option>
                                    <option value='ADMIN'>Admin</option>
                                    <option value='MEMBER'>Member</option>
                                </Form.Control>
                            </InputGroup>
                            <div className='mt-5 d-flex justify-content-between'>
                                <Button
                                    className='text-white btn-submit delete-button'
                                    variant='secondary'
                                    onClick={handleDelete}
                                >
                                    Delete Member
                                </Button>
                                <Button
                                    className='text-white btn-submit delete-button'
                                    variant='primary'
                                    onClick={handleUpdate}
                                >
                                    Update Member
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>
            </ModalComponent>
        </>
    );
};

RowActions.propTypes = {
    row: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    fetch: PropTypes.bool.isRequired,
    fetchAgain: PropTypes.func.isRequired
};

export default RowActions;
