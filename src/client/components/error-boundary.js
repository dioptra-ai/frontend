import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: null};
    }

    static getDerivedStateFromError(error) {
        return {error};
    }

    render() {
        if (this.state.error) {

            return this.props.renderError(this.state.error);
        } else {

            return this.props.children;
        }
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node,
    renderError: PropTypes.func
};
