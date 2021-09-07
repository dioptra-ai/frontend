import {useEffect} from 'react';
import {Redirect} from 'react-router';

import {setupComponent} from 'helpers/component-helper';

const Logout = ({authStore}) => {

    useEffect(() => {
        authStore.tryLogout();
    });

    if (authStore.isAuthenticated) {

        return 'Securely logging you out...';
    } else {

        return <Redirect to='/'/>;
    }
};

export default setupComponent(Logout);
