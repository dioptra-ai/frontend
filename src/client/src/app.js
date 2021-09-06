import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import AuthorizedTemplate from './pages/templates/authorized-template';
import {AuthorizedRouteConfigs} from './configs/route-config';
import Login from 'pages/login';
import Register from 'pages/register';

const App = () => {
    return (
        <>
            <Switch>
                <Route component={Login} exact path='/login' />
                <Route component={Register} exact path='/register' />
                {AuthorizedRouteConfigs.map(({path, isExact, component: C}) => (
                    <Route
                        component={() => <AuthorizedTemplate><C/></AuthorizedTemplate>}
                        exact={isExact}
                        key={path}
                        path={path}
                    />
                ))}
                <Route path='/'>
                    <Redirect to='/login' />
                </Route>
            </Switch>
        </>
    );
};

export default App;
