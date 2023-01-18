import React, {useEffect} from 'react';
import {Redirect, Route, Switch, useLocation} from 'react-router-dom';
import {Helmet} from 'react-helmet';

import {AuthorizedRouteConfigs} from './configs/route-config';
import Model from 'pages/model';
import Menu from 'components/menu';
import Login from 'pages/login';
import Logout from 'pages/logout';
import Register from 'pages/register';
import AuthRoute from 'components/auth-route';
import Miner from 'pages/miner';
import Dataset from 'pages/dataset';
import DatasetDiff from 'pages/dataset/diff';
import DatasetVersion from 'pages/dataset/dataset-version';
import DatasetList from 'pages/dataset-list';
import MinersList from 'pages/miners-list';
import Cart from 'pages/cart';
import AppContext from 'context/app-context';
import {initializeClickTracking, trackPage} from 'helpers/tracking';
import {getName} from 'helpers/name-helper';

const App = () => {
    const location = useLocation();

    useEffect(() => {
        initializeClickTracking();
    }, []);

    useEffect(() => {
        trackPage();
    }, [location.pathname]);

    return (
        <>
            <Route>
                {({location}) => (
                    <Helmet>
                        <title>Dioptra | {getName(location.pathname.split('/')[1])}</title>
                    </Helmet>
                )}
            </Route>
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
                )} />
                <AuthRoute path='/dataset/diff/:versionId1/:versionId2' renderLoggedIn={() => (
                    <DatasetDiff />
                )} />
                <AuthRoute path='/dataset/version/:versionId' renderLoggedIn={() => <DatasetVersion/>}/>
                <AuthRoute path='/dataset/:datasetId' renderLoggedIn={() => (
                    <Dataset/>
                )} />
                <AuthRoute path='/dataset' renderLoggedIn={() => (
                    <DatasetList/>
                )}/>
                <AuthRoute path='/miners/:minerId' renderLoggedIn={() => (
                    <Miner/>
                )}/>
                <AuthRoute path='/miners' renderLoggedIn={() => (
                    <MinersList/>
                )}/>
                <AuthRoute path='/cart' renderLoggedIn={() => (
                    <Cart/>
                )}/>
                <AuthRoute path='/' renderLoggedIn={() => <Redirect to='/models'/>}/>
            </Switch>
        </>
    );
};

export default App;
