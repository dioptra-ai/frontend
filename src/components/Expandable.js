import React, {useState} from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import FontIcon from './FontIcon'

const Expandable = ({content, expandedContent}) => {
  const [expand, setExpand] = useState(false)
  return (
    <>
      <Container>
        <Row className="align-items-center">
          <Col lg={11}>{content}</Col>
          <Col lg={1} className="text-center small">
            <span onClick={() => setExpand(!expand)}>
              <FontIcon icon={expand ? 'Arrow-Up' : 'Arrow-Down'} />
            </span>
          </Col>
        </Row>
      </Container>
      <Container className="border-bottom bg-light">
        {expand && expandedContent}
      </Container>
    </>
  )
}

export default Expandable
