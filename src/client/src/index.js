import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './app';
import state from './state/stores';
import './styles/custom.scss';
import {Provider} from 'mobx-react';


ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Provider {...state}>
                <App />
            </Provider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
