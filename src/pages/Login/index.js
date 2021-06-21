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
  row: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 15px"
  },
  col: {
    backgroundColor: "white",
    padding: "50px 20px",
    borderRadius: "0.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  logo: {
    width: "80px",
    marginBottom: "30px"
  },
  form: {
    width: "100%",
    button: {
      width: "100%",
      color: "white"
    }
  }
}

export default function Login() {
  return (
    <Container style={style.container}>
      <Row style={style.row}>
        <Col sm={12} md={8} lg={6} xl={4} style={style.col}>
          <Image src={Logo} style={style.logo} />
          <Form style={style.form}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" name="email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" />
            </Form.Group>

            <Button variant="primary" type="submit" style={style.form.button}>
              Log In
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
