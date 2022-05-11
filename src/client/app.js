import React, {useEffect} from 'react';
import {Redirect, Route, Switch, useLocation} from 'react-router-dom';
import {AuthorizedRouteConfigs} from './configs/route-config';
import Model from 'pages/model';
import Menu from 'components/menu';
import Login from 'pages/login';
import Logout from 'pages/logout';
import Register from 'pages/register';
import AuthRoute from 'components/auth-route';
import Benchmark from 'pages/benchmark';
import Miner from 'pages/miner';
import DatasetsList from 'pages/datasets-list';
import MinersList from 'pages/miners-list';
import Sandbox from 'pages/sandbox';
import AppContext from 'context/app-context';
import {initializeUserTracking, trackPage} from 'helpers/tracking';

const App = () => {
    const location = useLocation();

    useEffect(() => {
        initializeUserTracking();
    }, []);

    useEffect(() => {
        trackPage();
    }, [location.pathname]);

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
                <AuthRoute path='/models/*' renderLoggedIn={() => (
                    <AppContext.Provider value={{
                        isModelView: true
                    }}>
                        <Model/>
                    </AppContext.Provider>
                )}/>
                <AuthRoute path='/benchmark' renderLoggedIn={() => (
                    <AppContext.Provider value={{
                        isBenchmarkView: true
                    }}>
                        <Benchmark/>
                    </AppContext.Provider>
                )}/>
                <AuthRoute path='/dataset' renderLoggedIn={() => (
                    <DatasetsList/>
                )}/>
                <AuthRoute path='/miners/:minerId' renderLoggedIn={() => (
                    <Miner/>
                )}/>
                <AuthRoute path='/miners' renderLoggedIn={() => (
                    <MinersList/>
                )}/>
                <AuthRoute path='/sandbox' renderLoggedIn={() => (
                    <Sandbox/>
                )}/>
                <AuthRoute path='/' renderLoggedIn={() => <Redirect to='/models'/>}/>
            </Switch>
        </>
    );
};

export default App;
