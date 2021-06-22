import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Image from "react-bootstrap/Image"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Logo from "./../../assets/images/logo/logo.svg"

const style = {
  container: {
    height: "100vh"
  },
  logo: {
    width: "80px"
  }
}

export default () => {
  return (
    <Container style={style.container}>
      <Row className="h-100 p-2 align-items-center justify-content-center">
        <Col
          sm={12}
          md={8}
          lg={6}
          xl={4}
          className="bg-white rounded px-3 py-5 d-flex flex-column align-items-center"
        >
          <Image src={Logo} className="mb-5" style={style.logo} />
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
