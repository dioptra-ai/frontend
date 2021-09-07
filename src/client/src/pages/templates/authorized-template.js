import React from 'react';
import Menu from '../../components/menu';
import PropTypes from 'prop-types';
import {setupComponent} from '../../helpers/component-helper';
import {Redirect, useLocation} from 'react-router-dom';

const AuthorizedTemplate = ({children, authStore}) => {
    const {pathname, search, hash} = useLocation();

    return authStore.isAuthenticated ? (
        <div>
            <Menu />
            <div className='px-0 bg-white authorized-content'>{children}</div>
        </div>
    ) : (
        <Redirect to={{
            pathname: '/login',
            state: {from: {pathname, search, hash}}
        }}/>
    );
};

AuthorizedTemplate.propTypes = {
    authStore: PropTypes.object,
    children: PropTypes.object
};

export default setupComponent(AuthorizedTemplate);
