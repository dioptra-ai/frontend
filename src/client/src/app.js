import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AuthorizedTemplate from './pages/templates/authorized-template';
import {AuthorizedRouteConfigs} from './configs/route-config';
import Login from 'pages/login';
import Logout from 'pages/logout';
import Register from 'pages/register';
import AuthRoute from 'components/auth-route';

const App = () => {
    return (
        <>
            <Switch>
                <Route component={Login} exact path='/login' />
                <Route component={Logout} exact path='/logout' />
                <Route component={Register} exact path='/register' />
                {AuthorizedRouteConfigs.map(({path, isExact, component: C}) => (
                    <Route
                        component={() => <AuthorizedTemplate><C/></AuthorizedTemplate>}
                        exact={isExact}
                        key={path}
                        path={path}
                    />
                ))}
                <AuthRoute path='/'/>
            </Switch>
        </>
    );
};

export default App;
