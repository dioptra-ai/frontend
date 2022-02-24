import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './app';
import state from './state/stores';
import './styles/custom.scss';
import {Provider} from 'mobx-react';
import {ErrorBoundary} from 'react-error-boundary';
import Button from 'react-bootstrap/Button';

ReactDOM.render(
    <React.StrictMode>
        <ErrorBoundary
            FallbackComponent={({resetErrorBoundary}) => {

                return (
                    <div className='p-5'>
                        <h1 className='text-dark fs-3 text-center'>Oops! Something went wrong 😳</h1>
                        <h2 className='text-dark fs-5 text-center'>Thanks for your patience while we get it fixed.</h2>
                        <Button
                            className='w-100 text-white btn-submit mt-3'
                            type='submit'
                            variant='primary'
                            onClick={resetErrorBoundary}
                        >Back Home</Button>
                    </div>
                );
            }}
            onError={(error, info) => {
                console.error('Error, clearing local storage:', error, info);
                localStorage.clear();
            }}
            onReset={() => {
                window.location = '/';
            }}
        >
            <Router>
                <Provider {...state}>
                    <App />
                </Provider>
            </Router>
        </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root')
);
