import PropTypes from 'prop-types';

const ProgressBar = ({completed}) => {
    const containerStyle = {
        height: 10,
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden'
    };

    const fillerStyle = {
        height: '100%',
        width: `${completed}%`
    };

    return (
        <div className='bg-light-blue' style={containerStyle}>
            <div className='bg-primary' style={fillerStyle}></div>
        </div>
    );
};

ProgressBar.propTypes = {
    completed: PropTypes.number
};

export default ProgressBar;
