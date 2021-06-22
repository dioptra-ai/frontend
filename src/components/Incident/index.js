import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"

export default (props) => {
  const name = props.name
  const resolved = props.resolved
  const border = props.borderBottom
  const fullwidth = props.fullwidth
  return (
    <Row
      className={`py-3 d-flex align-items-center ${border ? "border-bottom" : ""}`}
    >
      <Col
        lg={fullwidth ? 12 : 10}
        className={`d-flex align-items-center ${fullwidth ? "" : "m-auto"}`}
      >
        <input type="checkbox" className="mx-2" />
        {resolved ? (
          <span className="Icon-Check text-success mx-2 fs-5"></span>
        ) : (
          <span className="Icon-Warning text-warning mx-2 fs-5"></span>
        )}
        <span className="flex-fill mx-2">{name}</span>
        <div className="mx-2 btn-wrapper">
          <Button
            variant={resolved ? "success" : "warning"}
            className="text-white w-100"
          >
            {resolved ? "Resolved" : "Open"}
          </Button>
        </div>
      </Col>
    </Row>
  )
}
