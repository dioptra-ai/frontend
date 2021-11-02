import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Tooltip from '../components/tooltip';
import FontIcon from '../components/font-icon';
import {setupComponent} from '../helpers/component-helper';
import {IconNames} from '../constants';
import baseJSONClient from 'clients/base-json-client';
import ModalComponent from 'components/modal';
import Table from 'components/table';
import Async from 'components/async';
import moment from 'moment';
import {HiPencilAlt, HiTrash} from 'react-icons/hi';

const apiKeyClient = (method, id = '') => {
    return baseJSONClient(`/api/api-key/${id}`, {method});
};

const SinceDate = ({value}) => {
    return `${moment().diff(moment(value), 'days')} days`;
};

SinceDate.propTypes = {
    value: PropTypes.string.isRequired
};

const RowActions = () => {
    return (
        <div className='d-flex justify-content-evenly'>
            <HiPencilAlt className='cursor-pointer' style={{fontSize: 20}} />
            <HiTrash className='cursor-pointer' style={{fontSize: 20}} />
        </div>
    );
};

const MembersTable = ({isAdmin, orgID}) => {
    const [openMemberModal, setOpenMemberModal] = useState(false);
    const [newMemberForm, setNewMemberForm] = useState({
        username: '',
        type: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (event) => setNewMemberForm({...newMemberForm, [event.target.name]: event.target.value});

    useEffect(() => {
        setNewMemberForm({
            username: '',
            type: ''
        });
    }, [openMemberModal, orgID]);

    const handleSubmit = () => {
        baseJSONClient(`/api/organization/members/${orgID}`, {
            method: 'post',
            body: newMemberForm
        })
            .then(() => {
                setError(null);
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
            <Async
                refetchOnChanged={[orgID, openMemberModal]}
                fetchData={() => baseJSONClient(`/api/organization/members/${orgID}`)}
                renderData={(members) => (
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
                                Header: 'Member Since',
                                Cell: SinceDate
                            }
                        ].concat(
                            isAdmin ?
                                [
                                    {
                                        id: 'actions',
                                        Header: 'Actions',
                                        Cell: RowActions
                                    }
                                ] :
                                []
                        )}
                    />
                )}
            />

            <ModalComponent
                isOpen={openMemberModal}
                onClose={() => setOpenMemberModal(false)}
            >
                <Container
                    className='model fs-6 d-flex align-items-center justify-content-center'
                    fluid
                >
                    <div className='model-form d-flex flex-column align-items-center'>
                        <p className='text-dark bold-text fs-3 mb-4'>Add New Member</p>
                        {error && <div className='bg-warning text-white p-3 mt-2'>{error}</div>}
                        <Form autoComplete='off' className='w-100'>
                            <InputGroup className='mt-1 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>Member Name</Form.Label>
                                <Form.Control
                                    className='bg-light w-100'
                                    name='username'
                                    onChange={handleChange}
                                    placeholder='Enter User Email'
                                    type='email'
                                    value={newMemberForm.username}
                                    required
                                />
                            </InputGroup>
                            <InputGroup className='mt-1 flex-column px-1'>
                                <Form.Label className='mt-3 mb-0 w-100'>Membership Type</Form.Label>
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
                                onClick={handleSubmit}
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

const Profile = ({authStore}) => {
    const {userData} = authStore;
    const [profileData, setProfileData] = useState({
        email: userData.username,
        password: '',
        confirmPassword: ''
    });
    const [emailError, setEmailError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [apiKeys, setApiKeys] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (profileData.email === '') {
            setEmailError('Please enter your email address.');
        } else if (profileData.password !== profileData.confirmPassword) {
            setConfirmPasswordError("Your password doesn't match");
        } else {
            authStore.tryUpdate({
                ...(profileData.email ? {username: profileData.email} : {}),
                ...(profileData.password && profileData.confirmPassword ?
                    {password: profileData.password} :
                    {})
            });
        }
    };

    const handleCreateApiKey = async () => {
        await apiKeyClient('post');

        return apiKeyClient('get').then(setApiKeys);
    };
    const handleDeleteApiKey = async (_id) => {
        await apiKeyClient('delete', _id);

        return apiKeyClient('get').then(setApiKeys);
    };

    const handleOrgRename = (e) => {
        e.preventDefault();

        baseJSONClient('/api/organization/rename', {
            method: 'POST',
            body: {name: orgName}
        })
            .then((res) => {
                setError('');
                if (res) {
                    authStore.userData = {
                        ...userData,
                        activeOrganizationMembership: {
                            ...userData.activeOrganizationMembership,
                            organization: res
                        }
                    };
                }
                setOpenEditModal(false);
            })
            .catch(() => setError('Something went wrong! Try again.'));
    };

    useEffect(() => {
        if (authStore.error) {
            setEmailError(authStore.error);
        }
    }, [authStore.error]);

    useEffect(() => {
        apiKeyClient('get').then(setApiKeys);
    }, []);

    useEffect(() => {
        const {activeOrganizationMembership} = userData;

        setOrgName(activeOrganizationMembership?.organization?.name || '');
    }, [userData, openEditModal]);

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Profile</p>
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${emailError ? 'error' : ''}`}
                                name='email'
                                onChange={(e) => {
                                    setProfileData({...profileData, ['email']: e.target.value});
                                    setEmailError('');
                                    authStore.error = null;
                                }}
                                type='email'
                                value={profileData.email}
                            />
                            {emailError && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                        {emailError && (
                            <Tooltip className='p-3 mt-2' color='warning' text={emailError} />
                        )}
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${confirmPasswordError ? 'error' : ''}`}
                                name='password'
                                onChange={(e) => {
                                    setProfileData({...profileData, ['password']: e.target.value});
                                }}
                                type='password'
                                value={profileData.password}
                            />
                            {confirmPasswordError && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Confirm New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${confirmPasswordError ? 'error' : ''}`}
                                name='confirmPassword'
                                onChange={(e) => {
                                    setProfileData({
                                        ...profileData,
                                        ['confirmPassword']: e.target.value
                                    });
                                    setConfirmPasswordError('');
                                }}
                                type='password'
                                value={profileData.confirmPassword}
                            />
                            {confirmPasswordError && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                        {confirmPasswordError && (
                            <Tooltip
                                className='p-3 mt-2'
                                color='warning'
                                text={confirmPasswordError}
                            />
                        )}
                    </Form.Group>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        disabled={authStore.loading}
                        type='submit'
                        variant='primary'
                    >
                        {authStore.loading ? 'Loading...' : 'Update'}
                    </Button>
                </Form>
                <p className='text-secondary text-center border-top border-muted mt-5 w-100'>
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        onClick={() => history.push('/logout')}
                        variant='secondary'
                    >
            Logout
                    </Button>
                </p>
            </div>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Organization</p>
                <div className='mb-3'>
                    <p className='m-0'>Organization Name</p>
                    <div className='d-flex justify-content-between align-items-center'>
                        <h6>{userData?.activeOrganizationMembership?.organization?.name}</h6>
                        {userData?.activeOrganizationMembership?.type === 'ADMIN' ? (
                            <Button
                                className='text-white btn-submit edit-button'
                                onClick={() => setOpenEditModal(true)}
                            >
                Edit
                            </Button>
                        ) : null}
                    </div>
                </div>
                <MembersTable
                    isAdmin={userData?.activeOrganizationMembership?.type === 'ADMIN'}
                    orgID={userData?.activeOrganizationMembership?.organization?._id}
                />
                <div className='text-secondary border-top border-muted mt-5 pt-5 w-100'>
                    <p className='text-dark bold-text fs-3'>Api Keys</p>
                    {apiKeys.map((apiKey) => (
                        <div key={apiKey._id}>
                            <pre style={{display: 'inline'}}>{apiKey.awsApiKey}</pre>
              &nbsp;
                            <Link
                                className='cursor-pointer'
                                to='#'
                                onClick={() => handleDeleteApiKey(apiKey._id)}
                            >
                (Delete)
                            </Link>
                        </div>
                    ))}
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        onClick={handleCreateApiKey}
                    >
            Create Api Key
                    </Button>
                </div>
            </div>
            <ModalComponent isOpen={openEditModal} onClose={() => setOpenEditModal(false)}>
                <Container
                    className='model fs-6 d-flex align-items-center justify-content-center'
                    fluid
                >
                    <div className='model-form d-flex flex-column align-items-center'>
                        <p className='text-dark bold-text fs-3 mb-4'>Update Organisation Name</p>
                        {error ? (
                            <div className='bg-warning text-white p-3 mt-2'>{error}</div>
                        ) : null}
                        <Form autoComplete='off' className='w-100' onSubmit={handleOrgRename}>
                            <Form.Label className='mt-3 mb-0'>Organisation Name</Form.Label>
                            <InputGroup className='mt-1'>
                                <Form.Control
                                    className={'bg-light'}
                                    name='mlModelId'
                                    onChange={({target}) => setOrgName(target.value)}
                                    placeholder='Enter Organisation Name'
                                    type='text'
                                    value={orgName}
                                    required
                                />
                            </InputGroup>
                            <Button
                                className='w-100 text-white btn-submit mt-5'
                                variant='primary'
                                type='submit'
                                disabled={!orgName}
                            >
                Update
                            </Button>
                        </Form>
                    </div>
                </Container>
            </ModalComponent>
        </Container>
    );
};

Profile.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Profile);
