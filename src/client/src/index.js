import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './app';
import state from './state/stores/initializer';
import './styles/custom.scss';
import {Provider} from 'mobx-react';


ReactDOM.render(
    <Router>
        <Provider {...state}>
            <App />
        </Provider>
    </Router>,
    document.getElementById('root')
);
