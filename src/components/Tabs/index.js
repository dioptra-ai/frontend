import {useState} from "react"

const tabs = [
  "Performance Overview",
  "Performance Details",
  "Feature Integrity",
  "Incidents & Alerts"
]

export default () => {
  const [active, setActive] = useState("Performance Overview")
  return (
    <div className="d-flex bg-white border-bottom pt-4">
      {tabs.map((tab, i) => (
        <div
          className={`tab ${active === tab ? "active text-primary" : ""} px-4`}
          key={i}
          onClick={() => setActive(tab)}
        >
          {tab}
          <span
            className={`d-block mt-4 border-bottom border-4 rounded-top ${
              active === tab ? "border-primary" : "border-white"
            }`}
          ></span>
        </div>
      ))}
    </div>
  )
}
