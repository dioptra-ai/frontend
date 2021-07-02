import React, {useEffect} from 'react';
import Menu from '../../components/menu';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import Model from './model';

const AuthorizedTemplate = ({children}) => {
    useEffect(() => {
    //LOGIN: Check user logged in status in app's global state, if false then redirect to Paths.LOGIN
    });

    return (
        <div>
            <Menu />
            <div className='px-0 bg-white authorized-content'>{children}
                <Route component={Model} path={'/models'}/>
            </div>
        </div>
    );
};

AuthorizedTemplate.propTypes = {
    children: PropTypes.element
};

export default AuthorizedTemplate;
