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

const Login = ({authStore}) => {
    const [loginData, setLoginData] = useState({email: '', password: ''});
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (loginData.email === '') {
            setEmailError('Please enter your email address.');
        } else if (loginData.password === '') {
            setPasswordError('Please enter your password.');
        } else {
            authStore.tryLogin({username: loginData.email, password: loginData.password});
        }
    };

    useEffect(() => {
        if (authStore.authError) {
            setEmailError(authStore.authError);
            setPasswordError(authStore.authError);
        }
    }, [authStore.authError]);

    return authStore.authStatus ? (
        <Redirect to={Paths().MODELS} />
    ) : (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <Logo className='mb-5' height={177} width={270} />
                <p className='text-dark bold-text fs-3 mb-4'>Log in</p>
                <Form autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${emailError ? 'error' : ''}`}
                            name='email'
                            onChange={(e) => {
                                setLoginData({...loginData, ['email']: e.target.value});
                                setEmailError('');
                            }}
                            placeholder='Enter your email'
                            type='text'
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
                    <InputGroup className='mt-3'>
                        <Form.Control
                            className={`bg-light text-secondary ${passwordError ? 'error' : ''}`}
                            name='password'
                            onChange={(e) => {
                                setLoginData({...loginData, ['password']: e.target.value});
                                setPasswordError('');
                            }}
                            placeholder='Enter your password'
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
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        type='submit'
                        variant='primary'
                    >
            LOG IN
                    </Button>
                </Form>
                <Link className='text-dark mt-3' to='forgot-password'>
          Forgot password?
                </Link>
                <p className='text-secondary text-center border-top border-muted mt-5 p-2'>
          If you need help with log in, please contact us at{' '}
                    <a className='text-secondary' href='mailto:support@dioptra.com'>
            support@dioptra.com
                    </a>
                </p>
            </div>
        </Container>
    );
};

Login.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Login);
