import React from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Logo from '../components/Logo'

const style = {
  container: {
    height: '100vh'
  }
}

export default function Login() {
  return (
    <Container className="bg-light" style={style.container}>
      <Row className="h-100 p-2 align-items-center justify-content-center">
        <Col
          sm={12}
          md={8}
          lg={6}
          xl={4}
          className="bg-white rounded px-3 py-5 d-flex flex-column align-items-center"
        >
          <Logo className="mb-3" />
          <Form className="w-100">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 text-white"
            >
              Log In
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
