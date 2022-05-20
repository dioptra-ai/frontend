import PropTypes from 'prop-types';
import {Redirect, Route, useLocation} from 'react-router-dom';

import {setupComponent} from 'helpers/component-helper';

const AuthRoute = ({userStore, renderLoggedIn, renderLoggedOut, ...rest}) => {
    const {pathname, search, hash} = useLocation();

    if (renderLoggedIn && userStore.isAuthenticated) {

        return <Route {...rest} render={() => renderLoggedIn({pathname, search, hash})}/>;
    } else if (renderLoggedOut && !userStore.isAuthenticated) {

        return <Route {...rest} render={() => renderLoggedOut({pathname, search, hash})}/>;
    } else return null;
};

AuthRoute.propTypes = {
    userStore: PropTypes.object.isRequired,
    renderLoggedIn: PropTypes.func,
    renderLoggedOut: PropTypes.func
};

AuthRoute.defaultProps = {
    renderLoggedIn: (location) => ( // eslint-disable-line react/display-name
        <Redirect to={{
            pathname: '/',
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
