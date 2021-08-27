import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import state from './state/stores';
import './styles/custom.scss';
import {Provider} from 'mobx-react';

import ErrorBoundary from 'components/error-boundary';
import StickyParamsRouter from 'components/sticky-params-router';

ReactDOM.render(
    <ErrorBoundary
        renderError={(e) => {
            console.error('Error, clearing local storage:', e);
            localStorage.clear();

            return null;
        }}
    >
        <StickyParamsRouter>
            <Provider {...state}>
                <App />
            </Provider>
        </StickyParamsRouter>
    </ErrorBoundary>,
    document.getElementById('root')
);
