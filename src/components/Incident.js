import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import FontIcon from './FontIcon'

const Incident = ({
  name = ' ',
  resolved = false,
  border = true,
  fullwidth = true
}) => {
  return (
    <Row
      className={`py-3 d-flex align-items-center ${border ? 'border-bottom' : ''}`}
    >
      <Col
        lg={fullwidth ? 12 : 10}
        className={`d-flex align-items-center ${fullwidth ? '' : 'm-auto'}`}
      >
        <input type="checkbox" className="mx-2" />
        <FontIcon
          icon={resolved ? 'Check' : 'Warning'}
          className={`text-${resolved ? 'success' : 'warning'} mx-2`}
          size="20"
        />
        <span className="flex-fill mx-2">{name}</span>
        <div className="mx-2 btn-wrapper">
          <Button
            variant={resolved ? 'success' : 'warning'}
            className="text-white w-100"
          >
            {resolved ? 'Resolved' : 'Open'}
          </Button>
        </div>
      </Col>
    </Row>
  )
}

export default Incident
