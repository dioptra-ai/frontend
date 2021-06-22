import Expandable from "../components/Expandable"
import Incident from "../components/Incident"

const incident = {
  name: "Some incident name",
  resolved: true,
  subIncidentes: [
    {
      name: "Some incident name",
      resolved: true
    },
    {
      name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.",
      resolved: false
    }
  ]
}
export default () => {
  return (
    <div
      style={{
        width: "60%",
        margin: "auto",
        padding: "50px",
        backgroundColor: "white"
      }}
    >
      <Expandable
        content={
          <Incident
            name={incident.name}
            resolved={incident.resolved}
            fullwidth={true}
          />
        }
        subContent={incident.subIncidentes.map((incident, i) => (
          <Incident
            key={i}
            name={incident.name}
            resolved={incident.resolved}
            borderBottom
            fullwidth={false}
          />
        ))}
      />
    </div>
  )
}
