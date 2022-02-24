import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'mobx-react';
import Button from 'react-bootstrap/Button';

import App from './app';
import state from './state/stores';
import './styles/custom.scss';

Sentry.init({
    dsn: 'https://0c17778bda074b85a984ae1c64ae1cdb@o1152673.ingest.sentry.io/6230917',
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
});

ReactDOM.render(
    <React.StrictMode>
        <Sentry.ErrorBoundary
            fallback={() => {

                return (
                    <div className='p-5'>
                        <h1 className='text-dark fs-3 text-center'>Oops! Something went wrong 😳</h1>
                        <h2 className='text-dark fs-5 text-center'>Thanks for your patience while we get it fixed.</h2>
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
            <Router>
                <Provider {...state}>
                    <App />
                </Provider>
            </Router>
        </Sentry.ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
);
