import {useState} from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

export default (props) => {
  const content = props.content
  const subContent = props.subContent
  const [expand, setExpand] = useState(false)
  return (
    <>
      <Container>
        <Row className="align-items-center">
          <Col lg={11}>{content}</Col>
          <Col lg={1} className="text-center small">
            <span
              className={expand ? "Icon-Arrow-Up" : "Icon-Arrow-Down"}
              onClick={() => setExpand(!expand)}
            ></span>
          </Col>
        </Row>
      </Container>
      <Container className="border-bottom bg-light">
        {expand && subContent}
      </Container>
    </>
  )
}
