import React from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import Logo from '../components/Logo'
import {Link} from 'react-router-dom'

export default function Login() {
  return (
    <Container className="Login">
      <Row className="h-100 p-2 align-items-center justify-content-center">
        <Col
          sm={12}
          md={8}
          lg={6}
          xl={4}
          className="bg-white rounded px-3 py-5 d-flex flex-column align-items-center"
        >
          <Logo className="mb-4" width={270} />
          <p className="text-dark h4 mb-4">Log in</p>
          <Form className="w-100" autoComplete="off">
            <InputGroup className="mb-3">
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-light border-0 text-secondary"
              />
            </InputGroup>

            <InputGroup className="mb-4">
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                className="bg-light border-0 text-secondary"
              />
            </InputGroup>

            <Button
              variant="primary"
              type="submit"
              className="w-100 text-white opacity-3"
            >
              LOG IN
            </Button>
          </Form>
          <Link to="forgot password" className="text-dark mt-3 password-link">
            Forgot password?
          </Link>
          <p className="text-secondary text-center border-top border-muted mt-5 pt-2">
            If you need help with log in, please contact us at{' '}
            <a href="" className="text-secondary">
              support@dioptra.com
            </a>
          </p>
        </Col>
      </Row>
    </Container>
  )
}
