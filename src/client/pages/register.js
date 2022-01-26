import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Logo from '../components/logo';
import {Link, Redirect} from 'react-router-dom';
import Tooltip from '../components/tooltip';
import FontIcon from '../components/font-icon';
import {setupComponent} from '../helpers/component-helper';
import {IconNames} from '../constants';
import {Paths} from '../configs/route-config';

const Register = ({authStore}) => {
    const [loginData, setLoginData] = useState({email: '', password: ''});
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (loginData.email === '') {
            setEmailError('Please enter your email address.');
        } else if (loginData.password === '') {
            setPasswordError('Please enter your password.');
        } else if (loginData.password !== loginData.confirmPassword) {
            setConfirmPasswordError('Your password does not match.');
        } else {
            authStore.tryRegister({username: loginData.email, password: loginData.password});
        }
    };

    useEffect(() => {
        if (authStore.error) {
            setEmailError(authStore.error);
            setPasswordError(authStore.error);
        }
    }, [authStore.error]);

    return _WEBPACK_DEF_FLAG_DISABLE_REGISTER_ ? (
        <Redirect to='/login'/>
    ) : authStore.isAuthenticated ? (
        <Redirect to={Paths().MODELS} />
    ) : (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <Logo className='mb-5' height={177} width={270} />
                <p className='text-dark bold-text fs-3 mb-4'>Register</p>
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light text-secondary ${emailError ? 'error' : ''}`}
                                name='email'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['email']: e.target.value});
                                    setEmailError('');
                                }}
                                required
                                type='email'
                                value={loginData.email}
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
                                className={`bg-light text-secondary ${passwordError ? 'error' : ''}`}
                                name='password'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['password']: e.target.value});
                                    setPasswordError('');
                                }}
                                required
                                type='password'
                                value={loginData.password}
                            />
                            {passwordError && (
                                <FontIcon
                                    className='text-warning error-icon'
                                    icon={IconNames.WARNING}
                                    size={20}
                                />
                            )}
                        </InputGroup>
                        {passwordError && (
                            <Tooltip className='p-3 mt-2' color='warning' text={passwordError} />
                        )}
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Confirm New Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className={`bg-light text-secondary ${confirmPasswordError ? 'error' : ''}`}
                                name='confirmPassword'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['confirmPassword']: e.target.value});
                                    setConfirmPasswordError('');
                                }}
                                required
                                type='password'
                                value={loginData.confirmPassword}
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
                            <Tooltip className='p-3 mt-2' color='warning' text={confirmPasswordError} />
                        )}
                    </Form.Group>
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        type='submit'
                        variant='primary'
                    >
                        REGISTER
                    </Button>
                </Form>
                <Link className='text-dark mt-3' to='/login'>
                    Login
                </Link>
                <p className='text-secondary text-center border-top border-muted mt-3 p-2'>
                    Forgot password? If you need help with log in, please contact us at
                    &nbsp;
                    <a className='text-secondary' href='mailto:info@dioptra.ai'>
                        info@dioptra.ai
                    </a>
                </p>
            </div>
        </Container>
    );
};

Register.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Register);
