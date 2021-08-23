import React from 'react';
import Menu from '../../components/menu';
import PropTypes from 'prop-types';
import {setupComponent} from '../../helpers/component-helper';
import {Redirect} from 'react-router-dom';
import {Paths} from '../../configs/route-config';

const AuthorizedTemplate = ({children, authStore}) => {
    return authStore.isAuthenticated ? (
        <div>
            <Menu />
            <div className='px-0 bg-white authorized-content'>{children}</div>
        </div>
    ) : (
        <Redirect to={Paths().LOGIN} />
    );
};

AuthorizedTemplate.propTypes = {
    authStore: PropTypes.object,
    children: PropTypes.object
};

export default setupComponent(AuthorizedTemplate);
