import {useEffect} from 'react';
import {Redirect} from 'react-router';
import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';

const Logout = ({userStore}) => {

    useEffect(() => {
        (async () => {
            await userStore.tryLogout();
            localStorage.clear();
        })();
    }, []);

    if (userStore.isAuthenticated) {

        return 'Securely logging you out...';
    } else {

        return <Redirect to='/'/>;
    }
};

Logout.propTypes = {
    userStore: PropTypes.object.isRequired
};

export default setupComponent(Logout);
