import {useEffect} from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

const Error = ({error, children, ...rest}) => {
    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return (
        <Alert variant='warning' {...rest} className='overflow-hidden'>
            {error ? String(error) : children}
        </Alert>
    );
};

Error.propTypes = {
    error: PropTypes.object,
    children: PropTypes.node
};

export default Error;
