import React from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'
import AuthorizedTemplate from './pages/templates/AuthorizedTemplate'
import {
  AuthorizedRouteConfigs,
  UnauthorizedRouteConfigs
} from './configs/routeConfig'
import {Paths} from './Constants'

const App = () => {
  return (
    <>
      <Switch>
        {UnauthorizedRouteConfigs.map(({path, isExact, component}) => (
          <Route key={path} exact={isExact} path={path} component={component} />
        ))}
        {AuthorizedRouteConfigs.map(({path, isExact, component}) => (
          <Route
            key={path}
            exact={isExact}
            path={path}
            component={() => <AuthorizedTemplate>{component}</AuthorizedTemplate>}
          />
        ))}
        />
        <Route path="/">
          <Redirect to={Paths.HOME} />
        </Route>
      </Switch>
    </>
  )
}

export default App
