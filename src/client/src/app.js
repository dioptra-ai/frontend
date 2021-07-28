import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import AuthorizedTemplate from './pages/templates/authorized-template';
import {AuthorizedRouteConfigs, Paths, UnauthorizedRouteConfigs} from './configs/route-config';

const App = () => {
    return (
        <>
            <Switch>
                {UnauthorizedRouteConfigs.map(({path, isExact, component: C}) => (
                    <Route component={C} exact={isExact} key={path} path={path} />
                ))}
                {AuthorizedRouteConfigs.map(({path, isExact, component: C}) => (
                    <Route
                        component={() => <AuthorizedTemplate><C/></AuthorizedTemplate>}
                        exact={isExact}
                        key={path}
                        path={path}
                    />
                ))}
                <Route path='/'>
                    <Redirect to={Paths().MODELS} />
                </Route>
            </Switch>
        </>
    );
};

export default App;
