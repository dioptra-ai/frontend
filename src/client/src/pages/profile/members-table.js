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
        type: ''
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [refetch, setRefetch] = useState(true);

    const handleChange = (event) => setNewMemberForm({
        ...newMemberForm,
        [event.target.name]: event.target.value
    });

    useEffect(() => {
        setNewMemberForm({
            username: '',
            type: ''
        });
        setError(null);
    }, [openMemberModal, orgID]);

    useEffect(() => {
        if (successMsg) {
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    }, [successMsg]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        baseJSONClient(`/api/organization-membership/${orgID}/members`, {
            method: 'post',
            body: newMemberForm
        })
            .then((res) => {
                setSuccessMsg(res);
                setOpenMemberModal(false);
            })
            .catch((e) => setError(e.message));
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
            {successMsg && <p>{successMsg}</p>}
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
                        {error && (
                            <div className='bg-warning text-white p-3 mt-2'>
                                {error}
                            </div>
                        )}
                        <Form
                            autoComplete='off'
                            className='w-100'
                            onSubmit={handleSubmit}
                        >
                            <InputGroup className='mt-1 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>
                                    Member Name
                                </Form.Label>
                                <Form.Control
                                    className='bg-light w-100'
                                    name='username'
                                    onChange={handleChange}
                                    placeholder='Enter User Email'
                                    type='text'
                                    value={newMemberForm.username}
                                    required
                                />
                            </InputGroup>
                            <InputGroup className='mt-1 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>
                                    Membership Type
                                </Form.Label>
                                <Form.Control
                                    as='select'
                                    className={'form-select bg-light w-100'}
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
                            <Button
                                className='w-100 text-white btn-submit mt-5'
                                variant='primary'
                                type='submit'
                            >
                                Add Member
                            </Button>
                        </Form>
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
