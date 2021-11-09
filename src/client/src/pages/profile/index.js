import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Tooltip from '../../components/tooltip';
import FontIcon from '../../components/font-icon';
import {setupComponent} from '../../helpers/component-helper';
import {IconNames} from '../../constants';
import baseJSONClient from 'clients/base-json-client';
import {OrganizationSwitchModel, OrganizationUpdateModal} from './profile-modals';
import MembersTable from './members-table';

const apiKeyClient = (method, id = '') => {
    return baseJSONClient(`/api/api-key/${id}`, {method});
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
    const [openSwitchModal, setOpenSwitchModal] = useState(false);
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
            }).then(() => setProfileData({...profileData, password: '', confirmPassword: ''}));
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
                    authStore.tryLogin();
                }
                setOpenEditModal(false);
            })
            .catch(() => setError('Something went wrong! Try again.'));
    };

    const handleOrgChange = ({original}) => {
        baseJSONClient('/api/user/change-membership', {
            method: 'PUT',
            body: {organizationMembershipID: original._id}
        })
            .then((res) => {
                setError('');
                if (res) {
                    authStore.tryLogin();
                }
                setOpenSwitchModal(false);
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
                                    setProfileData({
                                        ...profileData,
                                        ['email']: e.target.value
                                    });
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
                            <Tooltip
                                className='p-3 mt-2'
                                color='warning'
                                text={emailError}
                            />
                        )}
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light ${
                                    confirmPasswordError ? 'error' : ''
                                }`}
                                name='password'
                                onChange={(e) => {
                                    setProfileData({
                                        ...profileData,
                                        ['password']: e.target.value
                                    });
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
                                className={`bg-light ${
                                    confirmPasswordError ? 'error' : ''
                                }`}
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
                        <h6>
                            {
                                userData.activeOrganizationMembership.organization
                                    .name
                            }
                        </h6>
                        <div>
                            <Button
                                className='text-white btn-submit switch-button'
                                onClick={() => setOpenSwitchModal(true)}
                                variant='secondary'
                            >
                                Switch
                            </Button>
                            {userData.activeOrganizationMembership.type ===
                            'ADMIN' ? (
                                    <Button
                                        className='text-white btn-submit edit-button'
                                        onClick={() => setOpenEditModal(true)}
                                    >
                                    Edit
                                    </Button>
                                ) : null}
                        </div>
                    </div>
                </div>
                <MembersTable
                    isAdmin={
                        userData.activeOrganizationMembership.type === 'ADMIN'
                    }
                    orgID={userData.activeOrganizationMembership.organization._id}
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
            <OrganizationUpdateModal
                isOpen={openEditModal}
                value={orgName}
                error={error}
                handleClose={setOpenEditModal}
                handleChange={setOrgName}
                handleSubmit={handleOrgRename}
            />
            <OrganizationSwitchModel
                isOpen={openSwitchModal}
                currentMembership={
                    userData.activeOrganizationMembership._id
                }
                error={error}
                handleClose={setOpenSwitchModal}
                handleChange={handleOrgChange}
            />
        </Container>
    );
};

Profile.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Profile);
