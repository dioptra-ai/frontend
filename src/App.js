import React from "react"
import {Switch, Route} from "react-router-dom"
import Login from "./pages/Login"

const App = () => {
  return (
    <>
      <Switch>
        <Route exact path="/login" component={Login} />
      </Switch>
    </>
  )
}

export default App
