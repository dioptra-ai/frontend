import {IoTriangle} from 'react-icons/io5';
import PropTypes from 'prop-types';

const DifferenceLabel = ({difference, containerStyle = {}, diffStyles = {}}) => {
    return (
        <div style={containerStyle}>
            <span className='text-secondary metric-box-diffText' style={{
                fontSize: '80%',
                ...diffStyles
            }} title='vs. Benchmark'>
                {difference ? `${difference > 0 ? '+' : ''}${difference}` : '-'}%
                {difference && <IoTriangle
                    className={`metric-box-arrowIcon ${difference < 0 ? 'metric-box-arrowIcon-inverted' : ''}`}
                />
                }
            </span>
        </div>);
};

DifferenceLabel.propTypes = {
    containerStyle: PropTypes.object,
    difference: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    diffStyles: PropTypes.object
};

export default DifferenceLabel;
