import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import baseJSONClient from 'clients/base-json-client';
import ModalComponent from 'components/modal';
import Async from 'components/async';
import Table from 'components/table';
import {SinceDate} from './members-table';
import Badge from 'react-bootstrap/Badge';

const OrganizationUpdateModal = ({
    isOpen,
    value,
    error,
    handleClose,
    handleChange,
    handleSubmit
}) => {
    return (
        <ModalComponent isOpen={isOpen} title='Update Organisation Name' onClose={() => handleClose(false)}>
            <Container
                className='model fs-6 d-flex align-items-center justify-content-center'
                fluid
            >
                <div className='model-form d-flex flex-column align-items-center'>
                    {error ? (
                        <div className='bg-warning text-white p-3 mt-2'>{error}</div>
                    ) : null}
                    <Form
                        autoComplete='off'
                        className='w-100'
                        onSubmit={handleSubmit}
                    >
                        <Form.Label className='mt-3 mb-0'>
                            Organisation Name
                        </Form.Label>
                        <InputGroup className='mt-1'>
                            <Form.Control
                                className={'bg-light'}
                                name='mlModelId'
                                onChange={({target}) => handleChange(target.value)}
                                placeholder='Enter Organisation Name'
                                type='text'
                                value={value}
                                required
                            />
                        </InputGroup>
                        <Button
                            className='w-100 text-white btn-submit mt-5'
                            variant='primary'
                            type='submit'
                            disabled={!value}
                        >
                            Update
                        </Button>
                    </Form>
                </div>
            </Container>
        </ModalComponent>
    );
};

OrganizationUpdateModal.propTypes = {
    isOpen: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired
};

const OrganizationSwitchModel = ({
    isOpen,
    currentMembership,
    error,
    handleClose,
    handleChange
}) => {
    const isActiveMembership = ({original}) => original?._id === currentMembership;

    return (
        <ModalComponent isOpen={isOpen} title='Change Your Organisation' onClose={() => handleClose(false)}>
            <Container
                className='model fs-6 d-flex align-items-center justify-content-center switch-modal'
                fluid
            >
                <div className='model-form d-flex flex-column align-items-center'>
                    {error ? (
                        <div className='bg-warning text-white p-3 mt-2'>{error}</div>
                    ) : null}
                    <Async
                        refetchOnChanged={[]}
                        fetchData={() => baseJSONClient('/api/user/my-memberships')}
                        renderData={(memberships) => {
                            return (
                                <Table
                                    data={memberships}
                                    getRowProps={(row) => ({
                                        onClick: () => handleChange(row),
                                        className: `cursor-pointer hover ${
                                            isActiveMembership(row) ? 'active' : ''
                                        }`
                                    })}
                                    columns={[
                                        {
                                            accessor: 'organization.name',
                                            Header: 'User'
                                        },
                                        {
                                            accessor: 'type',
                                            Header: 'Membership Type'
                                        },
                                        {
                                            accessor: 'createdAt',
                                            Header: 'Member Since',
                                            Cell: (props) => (
                                                <>
                                                    <SinceDate {...props} />
                                                    {isActiveMembership(
                                                        // eslint-disable-next-line react/prop-types
                                                        props?.row
                                                    ) ? (
                                                            <Badge pill className='pill'>
                                                            Selected
                                                            </Badge>
                                                        ) : null}
                                                </>
                                            )
                                        }
                                    ]}
                                />
                            );
                        }}
                    />
                </div>
            </Container>
        </ModalComponent>
    );
};

OrganizationSwitchModel.propTypes = {
    isOpen: PropTypes.string.isRequired,
    currentMembership: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired
};

export {OrganizationUpdateModal, OrganizationSwitchModel};
