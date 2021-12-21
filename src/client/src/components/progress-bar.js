import PropTypes from 'prop-types';

const ProgressBar = ({completed}) => {
    return (
        <div
            className='bg-light-blue cursor-pointer'
            title={`${completed}%`}
            style={{height: 10, width: '100%', borderRadius: 2, overflow: 'hidden'}}
        >
            <div
                className='bg-primary'
                style={{height: '100%', width: `${completed}%`}}
            ></div>
        </div>
    );
};

ProgressBar.propTypes = {
    completed: PropTypes.number
};

export default ProgressBar;
