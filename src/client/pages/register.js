import React, {useState} from 'react';
import {Link, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import jwtDecode from 'jwt-decode';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import {StringParam, useQueryParam} from 'use-query-params';

import baseJSONClient from 'clients/base-json-client';
import Logo from 'components/logo';
import {setupComponent} from '../helpers/component-helper';
import LoadingForm from 'components/loading-form';

const Register = ({userStore}) => {
    const [token] = useQueryParam('token', StringParam);
    const decodedToken = token ? jwtDecode(token) : null;
    const [loginData, setLoginData] = useState({email: decodedToken?.username});

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (decodedToken) {
            if (loginData.confirmPassword !== loginData.password) {
                throw new Error('Passwords do not match.');
            }

            await userStore.tryRegister({
                username: loginData.email, password: loginData.password
            }, token);
        } else {

            await baseJSONClient.post('/api/user/registration-token', {username: loginData.email});
        }
    };

    return _WEBPACK_DEF_FLAG_DISABLE_REGISTER_ ? (
        <Redirect to='/login'/>
    ) : userStore.isAuthenticated ? (
        <Redirect to='/data-lake'/>
    ) : (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <Logo className='mb-5' height={177} width={270} />
                <p className='text-dark bold-text fs-3 mb-4'>Register</p>
                <LoadingForm autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <LoadingForm.Error />
                    <LoadingForm.Success >
                        {() => decodedToken ? 'Your account has been created.' : 'A registration link has been sent to your email.'}
                    </LoadingForm.Success>
                    <Form.Group className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                            <Form.Control
                                disabled={Boolean(decodedToken)}
                                className='bg-light'
                                name='email'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['email']: e.target.value});
                                }}
                                required
                                type='email'
                                value={loginData.email}
                            />
                        </InputGroup>
                    </Form.Group>
                    {
                        decodedToken ? (
                            <>
                                <Form.Group className='mb-3'>
                                    <Form.Label>New Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            className='bg-light'
                                            name='password'
                                            minLength={5}
                                            onChange={(e) => {
                                                setLoginData({...loginData, ['password']: e.target.value});
                                            }}
                                            required
                                            type='password'
                                            value={loginData.password}
                                        />
                                    </InputGroup>
                                    <Form.Text muted>
                                    Your password must be 5+ characters long.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            className='bg-light'
                                            name='confirmPassword'
                                            onChange={(e) => {
                                                setLoginData({...loginData, ['confirmPassword']: e.target.value});
                                            }}
                                            required
                                            type='password'
                                            value={loginData.confirmPassword}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <LoadingForm.Error />
                                <LoadingForm.Button
                                    className='w-100 text-white btn-submit mt-3'
                                    type='submit'
                                    variant='primary'
                                >
                                REGISTER
                                </LoadingForm.Button>
                            </>
                        ) : (
                            <LoadingForm.Button
                                className='w-100 text-white btn-submit mt-3'
                                type='submit'
                                variant='primary'
                            >
                                Send Registration Link
                            </LoadingForm.Button>
                        )
                    }
                </LoadingForm>
                <Link className='text-dark mt-3' to='/login'>
                    Login
                </Link>
                <p className='text-secondary text-center border-top border-muted mt-3 p-2'>
                    Forgot password? If you need help with log in, please contact us at
                    &nbsp;
                    <a className='text-secondary' href='mailto:hello@dioptra.ai'>
                        hello@dioptra.ai
                    </a>
                </p>
            </div>
        </Container>
    );
};

Register.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Register);
