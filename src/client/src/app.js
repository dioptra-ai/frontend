import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import AuthorizedTemplate from './pages/templates/authorized-template';
import {AuthorizedRouteConfigs, Paths, UnauthorizedRouteConfigs} from './configs/route-config';
import {renderComponent} from './helpers/component-helper';

const App = () => {
    return (
        <>
            <Switch>
                {UnauthorizedRouteConfigs.map(({path, isExact, component}) => (
                    <Route component={component} exact={isExact} key={path} path={path} />
                ))}
                {AuthorizedRouteConfigs.map(({path, isExact, component}) => (
                    <Route
                        component={() => <AuthorizedTemplate>{renderComponent(component)}</AuthorizedTemplate>}
                        exact={isExact}
                        key={path}
                        path={path}
                    />
                ))}
                <Route path='/'>
                    <Redirect to={Paths().HOME} />
                </Route>
            </Switch>
        </>
    );
};

export default App;
