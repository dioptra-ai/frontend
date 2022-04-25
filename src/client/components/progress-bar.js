import PropTypes from 'prop-types';

const ProgressBar = ({completed}) => {
    const displayCompleted = Number(completed).toFixed(2);

    return (
        <div
            className='bg-light-blue cursor-pointer'
            style={{height: 10, width: '100%', borderRadius: 2}}
        >
            <div
                className='bg-primary position-relative'
                style={{height: '100%', width: `${displayCompleted}%`}}
            >
                <span className='position-absolute text-secondary fs-6' style={{right: 0, top: -20}}>{displayCompleted}%</span>
            </div>
        </div>
    );
};

ProgressBar.propTypes = {
    completed: PropTypes.number
};

export default ProgressBar;
