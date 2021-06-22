import React from "react"
import {Switch, Route} from "react-router-dom"
import Login from "./pages/Login"
import Test from "./pages/test"

const App = () => {
  return (
    <>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/test" component={Test} />
      </Switch>
    </>
  )
}

export default App
