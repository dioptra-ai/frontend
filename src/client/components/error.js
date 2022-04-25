import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';

const Error = ({error, children, ...rest}) => (
    <Alert variant='danger' {...rest} className='overflow-hidden'>
        {error ? String(error) : children}
    </Alert>
);

Error.propTypes = {
    error: PropTypes.object,
    children: PropTypes.node
};

export default Error;
