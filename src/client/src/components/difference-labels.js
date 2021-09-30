import {IoTriangle} from 'react-icons/io5';
import PropTypes from 'prop-types';

const DifferenceLabel = ({value, difference, containerStyle = {}, baseClasses = '', diffStyles = {}}) => {
    return (
        <div style={containerStyle}>
            <span className={baseClasses}>{value}</span>
            <span className='text-secondary metric-box-diffText' style={{
                fontSize: '80%',
                ...diffStyles
            }} title='vs. Benchmark Date Range'>
                {difference ? `${difference > 0 ? '+' : ''}${difference}` : '-'}%
                {difference && <IoTriangle
                    className={`metric-box-arrowIcon ${difference < 0 ? 'metric-box-arrowIcon-inverted' : ''}`}
                />
                }
            </span>
        </div>);
};

DifferenceLabel.propTypes = {
    baseClasses: PropTypes.string,
    containerStyle: PropTypes.object,
    difference: PropTypes.number.isRequired,
    diffStyles: PropTypes.object,
    value: PropTypes.number.isRequired
};

export default DifferenceLabel;
