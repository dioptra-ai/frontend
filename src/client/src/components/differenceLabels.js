import {IoTriangle} from 'react-icons/io5';
import PropTypes from 'prop-types';

const DifferenceLabel = ({value, difference}) => {
    return (<div>
        <span>{value ? `${(value * 100).toFixed(2)} %` : 0}</span>
        <span className='text-primary metric-box-diffText'>
            {difference ? `${difference > 0 ? '+' : ''}${(difference * 100).toFixed(2)}` : '-'}%
            {difference && <IoTriangle
                className={`metric-box-arrowIcon ${difference < 0 ? 'metric-box-arrowIcon-inverted' : ''}`}
            />
            }
        </span>
    </div>);
};

DifferenceLabel.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    difference: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default DifferenceLabel;
