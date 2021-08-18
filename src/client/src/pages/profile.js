import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Tooltip from '../components/tooltip';
import FontIcon from '../components/font-icon';
import {setupComponent} from '../helpers/component-helper';
import {IconNames} from '../constants';

const Profile = ({authStore}) => {
    const [profileData, setProfileData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [emailError, setEmailError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

    useEffect(() => {
        if (authStore.authError) {
            setEmailError(authStore.authError);
        }
    }, [authStore.authError]);

    useEffect(() => {
        if (authStore.success) {
            setProfileData({
                email: '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [authStore.success]);

    return (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <p className='text-dark bold-text fs-3 mb-4'>Update Profile</p>
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${emailError ? 'error' : ''}`}
                            name='email'
                            onChange={(e) => {
                                setProfileData({...profileData, ['email']: e.target.value});
                                setEmailError('');
                                authStore.authError = null;
                            }}
                            placeholder='Enter your new email'
                            type='text'
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
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${
                                confirmPasswordError ? 'error' : ''
                            }`}
                            name='password'
                            onChange={(e) => {
                                setProfileData({...profileData, ['password']: e.target.value});
                            }}
                            placeholder='Enter your new password'
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
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${
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
                            placeholder='Confirm your Password'
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
                        onClick={() => authStore.tryLogout()}
                        variant='secondary'
                    >
            Logout
                    </Button>
                </p>
            </div>
        </Container>
    );
};

Profile.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Profile);
