import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './app';
import state from './state/stores';
import './styles/custom.scss';
import {Provider} from 'mobx-react';
import ErrorBoundary from 'components/error-boundary';

ReactDOM.render(
    <ErrorBoundary renderError={(e) => {
        console.error('Error, clearing local storage:', e);
        localStorage.clear();

        return null;
    }}>
        <Router>
            <Provider {...state}>
                <App />
            </Provider>
        </Router>
    </ErrorBoundary>,
    document.getElementById('root')
);
