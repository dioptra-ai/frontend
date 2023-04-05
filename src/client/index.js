import * as Sentry from '@sentry/react'; // Initialized with segment.io
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider as StateProvider} from 'mobx-react';
import {ReactRouter5Adapter} from 'use-query-params/adapters/react-router-5';
import {QueryParamProvider} from 'use-query-params';
import Button from 'react-bootstrap/Button';

import App from './app';
import Spinner from 'components/spinner';
import state from 'state/stores';
import 'styles/custom.scss';

const Index = ({children}) => (
    <React.StrictMode>
        <Sentry.ErrorBoundary
            fallback={() => {

                return (
                    <div className='p-5'>
                        <h1 className='text-dark fs-3 text-center'>Oops! Something went wrong 😳</h1>
                        <h2 className='text-dark fs-5 text-center'>We have been notified and we will get it fixed!</h2>
                        <Button
                            className='w-100 text-white btn-submit mt-3'
                            type='submit'
                            variant='primary'
                            onClick={() => {
                                window.location = '/';
                            }}
                        >Back Home</Button>
                    </div>
                );
            }}
            onError={(error, info) => {
                console.error('Error, clearing local storage:', error, info);
                localStorage.clear();
            }}
        >
            {children}
        </Sentry.ErrorBoundary>
    </React.StrictMode>
);

Index.propTypes = {
    children: PropTypes.node.isRequired
};

ReactDOM.render(
    <Index><Spinner/></Index>,
    document.getElementById('root')
);

state.initializeStores().then(() => {

    ReactDOM.render(
        <Index>
            <Router>
                <QueryParamProvider adapter={ReactRouter5Adapter}>
                    <StateProvider {...state}>
                        <App />
                    </StateProvider>
                </QueryParamProvider>
            </Router>
        </Index>,
        document.getElementById('root')
    );
});

// Use by segment.io to set the release in sentry.
// See https://segment.com/docs/connections/destinations/catalog/sentry/
window['COMMIT_REF'] = _WEBPACK_DEF_COMMIT_REF_;
