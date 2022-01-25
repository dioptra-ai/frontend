import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {AuthorizedRouteConfigs} from './configs/route-config';
import Model from 'pages/templates/model-template';
import Menu from 'components/menu';
import Login from 'pages/login';
import Logout from 'pages/logout';
import Register from 'pages/register';
import AuthRoute from 'components/auth-route';
import Benchmarks from './pages/benchmarks';
import AppContext from 'context/app-context';

const App = () => {
    return (
        <>
            <Switch>
                <Route component={Login} exact path='/login' />
                <Route component={Logout} exact path='/logout' />
                <Route component={Register} exact path='/register' />
                {/* This is crap - just inline all the routes here */}
                {AuthorizedRouteConfigs.map(({path, isExact, component: C}) => (
                    <Route
                        render={() => <Menu><C/></Menu>}
                        exact={isExact}
                        key={path}
                        path={path}
                    />
                ))}
                <AuthRoute path='/models/:_id' renderLoggedIn={() => (
                    <AppContext.Provider value={{
                        isTimeEnabled: true
                    }}>
                        <Model/>
                    </AppContext.Provider>
                )}/>
                <AuthRoute path='/benchmarks' renderLoggedIn={() => (
                    <AppContext.Provider value={{
                        isTimeEnabled: false
                    }}>
                        <Benchmarks/>
                    </AppContext.Provider>
                )}/>
                <AuthRoute path='/'/>
            </Switch>
        </>
    );
};

export default App;
