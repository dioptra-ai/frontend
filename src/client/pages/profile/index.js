import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import {setupComponent} from '../../helpers/component-helper';
import baseJSONClient from 'clients/base-json-client';
import {OrganizationSwitchModel, OrganizationUpdateModal} from './profile-modals';
import MembersTable from './members-table';
import LoadingForm from 'components/loading-form';

const apiKeyClient = (method, id = '') => {
    return baseJSONClient(`/api/api-key/${id}`, {method});
};

const Profile = ({userStore}) => {
    const {userData} = userStore;
    const [profileData, setProfileData] = useState({
        email: userData.username,
        password: '',
        confirmPassword: ''
    });
    const [apiKeys, setApiKeys] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openSwitchModal, setOpenSwitchModal] = useState(false);
    const [orgName, setOrgName] = useState('');
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (profileData.password !== profileData.confirmPassword) {
            throw new Error("Your password doesn't match");
        }
        await userStore.tryUpdate({
            ...(profileData.email ? {username: profileData.email} : {}),
            ...(profileData.password && profileData.confirmPassword ?
                {password: profileData.password} : {}
            )
        });
    };
    const handleDeleteApiKey = async (_id) => {
        await apiKeyClient('delete', _id);

        const apiKeys = await apiKeyClient('get');

        setApiKeys(apiKeys);
    };
    const handleOrgRename = async (e) => {
        e.preventDefault();

        const res = await baseJSONClient('/api/organization/rename', {
            method: 'POST',
            body: {name: orgName}
        });

        if (res) {
            await userStore.tryLogin();
        }

        setOpenEditModal(false);
    };
    const handleOrgChange = async ({original}) => {
        const res = await baseJSONClient('/api/user/active-membership', {
            method: 'PUT',
            body: {organizationMembershipID: original._id}
        });

        if (res) {
            await userStore.tryLogin();
        }

        setOpenSwitchModal(false);
    };

    useEffect(() => {
        apiKeyClient('get').then(setApiKeys);
    }, []);

    useEffect(() => {
        const {activeOrganizationMembership} = userData;

        setOrgName(activeOrganizationMembership.organization.name || '');
    }, [userData, openEditModal]);

    return (
        <Container className='login fs-6 d-flex px-4 profile' fluid>
            <div className='login-form d-flex flex-column m-4'>
                <p className='text-dark bold-text fs-3'>Profile</p>
                <LoadingForm autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={'bg-light'}
                                name='email'
                                onChange={(e) => {
                                    setProfileData({
                                        ...profileData,
                                        ['email']: e.target.value
                                    });
                                }}
                                type='email'
                                value={profileData.email}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={'bg-light'}
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
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Confirm New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={'bg-light'}
                                name='confirmPassword'
                                onChange={(e) => {
                                    setProfileData({
                                        ...profileData,
                                        ['confirmPassword']: e.target.value
                                    });
                                }}
                                type='password'
                                value={profileData.confirmPassword}
                            />
                        </InputGroup>
                    </Form.Group>
                    <LoadingForm.Error/>
                    <LoadingForm.Button
                        className='w-100 text-white btn-submit mt-3'
                        type='submit'
                        variant='primary'
                    >
                        Update
                    </LoadingForm.Button>
                </LoadingForm>
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
                <div className='my-3'>
                    <MembersTable
                        isAdmin={
                            userData.activeOrganizationMembership.type === 'ADMIN'
                        }
                        orgID={userData.activeOrganizationMembership.organization._id}
                    />
                </div>
                <div className='text-secondary border-muted my-3 pt-3 w-100'>
                    <p className='text-dark bold-text fs-3'>Your api keys</p>
                    <div className='text-secondary'>
                        Use the <b>x-api-key</b> HTTP header to authenticate API calls with api keys.
                    </div>
                    <hr/>
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
                    {/* <Alert variant='primary'>
                        Please reach out to <a className='text-secondary' href={`mailto:hello@dioptra.ai?subject=New API Key request&body=Hello, I would like a new Api key for the organization "${userStore.userData.activeOrganizationMembership.organization.name}". Thank you!`}>hello@dioptra.ai</a> to create an API key.
                    </Alert> */}
                    <Button
                        className='w-100 text-white btn-submit mt-5'
                        onClick={async () => {
                            await apiKeyClient('post');

                            return apiKeyClient('get').then(setApiKeys);
                        }}
                    >
                        Create Api Key
                    </Button>
                </div>
            </div>
            <OrganizationUpdateModal
                isOpen={openEditModal}
                value={orgName}
                handleClose={setOpenEditModal}
                handleChange={setOrgName}
                handleSubmit={handleOrgRename}
            />
            <OrganizationSwitchModel
                isOpen={openSwitchModal}
                currentMembership={
                    userData.activeOrganizationMembership._id
                }
                handleClose={setOpenSwitchModal}
                handleChange={handleOrgChange}
            />
        </Container>
    );
};

Profile.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Profile);
