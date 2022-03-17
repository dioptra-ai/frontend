import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Logo from '../components/logo';
import {Link, Redirect, useLocation} from 'react-router-dom';
import Tooltip from '../components/tooltip';
import FontIcon from '../components/font-icon';
import {setupComponent} from '../helpers/component-helper';
import {IconNames} from '../constants';
import Spinner from 'components/spinner';

const Login = ({authStore}) => {
    const [loginData, setLoginData] = useState({email: '', password: ''});
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const location = useLocation();
    const [initialLocation] = useState(location.state?.from);

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
        if (authStore.error) {
            setEmailError(authStore.error);
            setPasswordError(authStore.error);
        }
    }, [authStore.error]);

    useEffect(() => {
        if (authStore.userData.id) {
            window.analytics.identify(authStore.userData.id, {
                email: loginData.email
            });
        }
    }, [authStore.userData.id]);

    return authStore.loading ? (
        <Spinner/>
    ) : authStore.isAuthenticated ? (
        <Redirect to={initialLocation} />
    ) : (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <Logo className='mb-5' height={177} width={270} />
                <p className='text-dark bold-text fs-3 mb-4'>Log in</p>
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
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Password</Form.Label>
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
                    <Button
                        className='w-100 text-white btn-submit mt-3'
                        type='submit'
                        variant='primary'
                    >
                            LOG IN
                    </Button>
                </Form>
                {!_WEBPACK_DEF_FLAG_DISABLE_REGISTER_ ? (
                    <Link className='text-dark mt-3' to='/register'>
                        Register
                    </Link>
                ) : null}
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

Login.propTypes = {
    authStore: PropTypes.object
};

export default setupComponent(Login);
