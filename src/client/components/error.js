import PropTypes from 'prop-types';
import {useEffect} from 'react';
import Alert from 'react-bootstrap/Alert';

const Error = ({error, children, ...rest}) => {

    useEffect(() => {
        console.error(error);
    });

    return (
        <Alert variant='danger' {...rest}>
            {error ? String(error) : children}
        </Alert>
    );
};

Error.propTypes = {
    error: PropTypes.object,
    children: PropTypes.node
};

export default Error;
