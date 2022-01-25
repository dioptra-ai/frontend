import {useEffect} from 'react';
import {Redirect} from 'react-router';
import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';

const Logout = ({authStore}) => {

    useEffect(() => {
        authStore.tryLogout();
        localStorage.clear();
    });

    if (authStore.isAuthenticated) {

        return 'Securely logging you out...';
    } else {

        return <Redirect to='/'/>;
    }
};

Logout.propTypes = {
    authStore: PropTypes.object.isRequired
};

export default setupComponent(Logout);
