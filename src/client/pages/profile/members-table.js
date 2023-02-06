import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import baseJSONClient from 'clients/base-json-client';
import ModalComponent from 'components/modal';
import Table from 'components/table';
import Async from 'components/async';
import RowActions from './row-actions';
import {Link} from 'react-router-dom';
import LoadingForm from 'components/loading-form';

import moment from 'moment';

const SinceDate = ({value}) => {
    return `${moment().diff(moment(value), 'days')} days`;
};

SinceDate.propTypes = {
    value: PropTypes.string.isRequired
};

const MembersTable = ({isAdmin, orgID}) => {
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const [newMemberForm, setNewMemberForm] = useState({
        username: '',
        password: '',
        type: ''
    });
    const [refetch, setRefetch] = useState(true);

    const handleChange = (event) => setNewMemberForm({
        ...newMemberForm,
        [event.target.name]: event.target.value
    });

    useEffect(() => {
        setNewMemberForm({
            username: '',
            password: '',
            type: ''
        });
    }, [openMemberModal, orgID]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        await baseJSONClient(`/api/organization-membership/${orgID}/members`, {
            method: 'post',
            body: newMemberForm
        });
        setOpenMemberModal(false);
    };

    return (
        <>
            <div className='members'>
                <p className='text-dark bold-text d-flex justify-content-between align-items-center'>
                    <span>Members</span>
                    {isAdmin && (
                        <Button
                            className='text-white btn-submit add-member-button'
                            onClick={() => setOpenMemberModal(true)}
                            variant='secondary'
                        >
                            Add Member
                        </Button>
                    )}
                </p>
            </div>
            <Async
                refetchOnChanged={[orgID, openMemberModal, refetch]}
                fetchData={() => baseJSONClient(`/api/organization-membership/${orgID}/members`)}
                renderData={(members) => members.length ? (
                    <Table
                        data={members}
                        columns={[
                            {
                                accessor: 'user.username',
                                Header: 'User'
                            },
                            {
                                accessor: 'user.password',
                                Header: 'Password'
                            },
                            {
                                accessor: 'type',
                                Header: 'Membership Type'
                            },
                            {
                                accessor: 'createdAt',
                                Header: 'Member for',
                                Cell: SinceDate
                            }
                        ].concat(
                            isAdmin ?
                                [
                                    {
                                        id: 'actions',
                                        Cell: (props) => (
                                            <RowActions
                                                {...props}
                                                fetchAgain={setRefetch}
                                                fetch={refetch}
                                            />
                                        )
                                    }
                                ] :
                                []
                        )}
                    />
                ) : (
                    <p className='text-center'>No Members</p>
                )
                }
            />

            <ModalComponent
                isOpen={openMemberModal}
                onClose={() => setOpenMemberModal(false)}
                title='Add New Member'
            >
                <Container
                    className='model fs-6 d-flex align-items-center justify-content-center'
                    fluid
                >
                    <div className='model-form d-flex flex-column align-items-center'>
                        <LoadingForm
                            autoComplete='off'
                            className='w-100'
                            onSubmit={handleSubmit}
                        >
                            <InputGroup className='mb-3 flex-column px-1'>
                                <Form.Label className='mt-3 mb-1 w-100'>
                                    Member Email (creates a new user if not already registered)
                                </Form.Label>
                                <Form.Control
                                    className='bg-light w-100 mb-3'
                                    name='username'
                                    onChange={handleChange}
                                    type='email'
                                    value={newMemberForm.username}
                                    required
                                />
                                <Form.Label className='mb-1 mb-0 w-100'>
                                    Password (required if user is not already registered)
                                </Form.Label>
                                <Form.Control
                                    className='bg-light w-100'
                                    name='password'
                                    onChange={handleChange}
                                    type='password'
                                    value={newMemberForm.password}
                                />
                                <Form.Label className='mb-0 w-100'>
                                    Share the link - <Link to={`${window.location.origin}/login`}>{window.location.origin}/login </Link>
                                    with the new user to login with credentials that have been set.
                                </Form.Label>
                            </InputGroup>
                            <InputGroup className='mb-3 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>
                                    Membership Type
                                </Form.Label>
                                <Form.Control
                                    as='select'
                                    className={'form-select w-100'}
                                    name='type'
                                    value={newMemberForm.type}
                                    onChange={handleChange}
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
                            <LoadingForm.Error/>
                            <LoadingForm.Button
                                className='w-100 text-white btn-submit mt-3'
                                variant='primary'
                                type='submit'
                            >
                                Add Member
                            </LoadingForm.Button>
                        </LoadingForm>
                    </div>
                </Container>
            </ModalComponent>
        </>
    );
};

MembersTable.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
    orgID: PropTypes.string.isRequired
};

export {SinceDate};

export default MembersTable;
