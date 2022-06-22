import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Logo from '../components/logo';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {setupComponent} from '../helpers/component-helper';
import LoadingForm from 'components/loading-form';

const Login = ({userStore}) => {
    const [loginData, setLoginData] = useState({email: '', password: ''});
    const location = useLocation();
    const [initialLocation] = useState(location.state?.from);

    const handleSubmit = async (e) => {
        e.preventDefault();

        await userStore.tryLogin({username: loginData.email, password: loginData.password});
    };

    return userStore.isAuthenticated ? (
        <Redirect to={initialLocation} />
    ) : (
        <Container
            className='login fs-6 d-flex align-items-center justify-content-center'
            fluid
        >
            <div className='login-form d-flex flex-column align-items-center'>
                <Logo className='mb-5' height={177} width={270} />
                <p className='text-dark bold-text fs-3 mb-4'>Log in</p>
                <LoadingForm autoComplete='off' className='w-100' onSubmit={handleSubmit}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Email</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className='bg-light'
                                name='email'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['email']: e.target.value});
                                }}
                                required
                                type='text'
                                value={loginData.email}
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                            <Form.Control
                                className='bg-light'
                                name='password'
                                onChange={(e) => {
                                    setLoginData({...loginData, ['password']: e.target.value});
                                }}
                                required
                                type='password'
                                value={loginData.password}
                            />
                        </InputGroup>
                    </Form.Group>
                    <LoadingForm.Error/>
                    <LoadingForm.Button
                        className='w-100 text-white btn-submit mt-3'
                        type='submit'
                        variant='primary'
                    >
                        LOG IN
                    </LoadingForm.Button>
                </LoadingForm>
                {!_WEBPACK_DEF_FLAG_DISABLE_REGISTER_ ? (
                    <Link className='text-dark mt-3' to='/register'>
                        Register
                    </Link>
                ) : null}
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

Login.propTypes = {
    userStore: PropTypes.object
};

export default setupComponent(Login);
