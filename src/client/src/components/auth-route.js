import PropTypes from 'prop-types';
import {Redirect, Route, useLocation} from 'react-router-dom';

import {setupComponent} from 'helpers/component-helper';

const AuthRoute = ({authStore, renderLoggedIn, renderLoggedOut, ...rest}) => {
    const {pathname, search, hash} = useLocation();

    if (renderLoggedIn && authStore.isAuthenticated) {

        return <Route {...rest} render={() => renderLoggedIn({pathname, search, hash})}/>;
    } else if (renderLoggedOut && !authStore.isAuthenticated) {

        return <Route {...rest} render={() => renderLoggedOut({pathname, search, hash})}/>;
    } else return null;
};

AuthRoute.propTypes = {
    authStore: PropTypes.object.isRequired,
    renderLoggedIn: PropTypes.func,
    renderLoggedOut: PropTypes.func
};

AuthRoute.defaultProps = {
    renderLoggedIn: (location) => ( // eslint-disable-line react/display-name
        <Redirect to={{
            pathname: '/home',
            state: {from: location}
        }}/>
    ),
    renderLoggedOut: (location) => ( // eslint-disable-line react/display-name
        <Redirect to={{
            pathname: '/login',
            state: {from: location}
        }}/>
    )
};

export default setupComponent(AuthRoute);
