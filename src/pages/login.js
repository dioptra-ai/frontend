import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Logo from '../components/logo';
import {Link} from 'react-router-dom';

const Login = () => {
    return (
        <Container className='login'>
            <Row className='h-100 p-2 align-items-center justify-content-center'>
                <Col
                    className='bg-white rounded px-3 py-5 d-flex flex-column align-items-center'
                    lg={6}
                    md={8}
                    sm={12}
                    xl={4}
                >
                    <Logo className='mb-4' width={270} />
                    <p className='text-dark h4 mb-4'>Log in</p>
                    <Form autoComplete='off' className='w-100'>
                        <InputGroup className='mb-3'>
                            <Form.Control
                                className='bg-light text-secondary'
                                name='email'
                                placeholder='Enter your email'
                                type='email'
                            />
                        </InputGroup>

                        <InputGroup className='mb-4'>
                            <Form.Control
                                className='bg-light text-secondary'
                                name='password'
                                placeholder='Enter your password'
                                type='password'
                            />
                        </InputGroup>

                        <Button
                            className='w-100 text-white opacity-3'
                            type='submit'
                            variant='primary'
                        >
              LOG IN
                        </Button>
                    </Form>
                    <Link className='text-dark mt-3 password-link' to='forgot password'>
            Forgot password?
                    </Link>
                    <p className='text-secondary text-center border-top border-muted mt-5 pt-2'>
            If you need help with log in, please contact us at{' '}
                        <a className='text-secondary' href=''>
              support@dioptra.com
                        </a>
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
