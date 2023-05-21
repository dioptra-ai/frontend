import {useState} from 'react';
import PropTypes from 'prop-types';
import truncate from 'truncate';

const LoadingLink = ({children, onClick, ...props}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleClick = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const success = await onClick(e);

            setSuccess(success);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            // Reset after 1 second
            setTimeout(() => {
                setSuccess(false);
                setError(null);
            }, 1000);
        }
    };

    return (
        <a href='#' onClick={handleClick} {...props}>
            {
                loading ? (
                    <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'/>
                ) : error ? (
                    <span className='text-danger'>{truncate(error.message, typeof children === 'string' ? children.length : 20)}</span>
                ) : success ? (
                    <span className='text-success'>Success</span>
                ) : children
            }
        </a>
    );
};

LoadingLink.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

export default LoadingLink;
