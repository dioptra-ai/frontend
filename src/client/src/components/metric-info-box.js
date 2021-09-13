import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';

const MetricInfoBox = ({value, notifications, warnings, name, sampleSize, unit, difference}) => (
    <div className='border rounded p-3 w-100 d-flex flex-column align-items-center justify-content-center metric-box'>
        <div className='d-flex flex-wrap'>
            <span className='text-dark-bold bold-text'>{name}</span>
            {sampleSize && <span className='text-primary mx-1'>(n={sampleSize})</span>}
            {notifications && <FontIcon
                className='text-dark flex-grow-1'
                icon={IconNames.ALERTS_BELL}
                size={16}
            />}
            {warnings && <div className='d-flex align-items-center'>
                <FontIcon
                    className='text-warning'
                    icon={IconNames.WARNING}
                    size={16}/>
                <Link className='text-warning mx-1 fs-7' to='/'>
                    View Incidents
                </Link>
            </div>}
        </div>
        <span className='text-dark' style={{fontSize: '60px'}}>{value ? value.toFixed(1) : '-'}{unit}</span>
        <span className='text-dark metric-box-diffText'>
            {difference ? difference.toFixed(2) : '-'}{unit}
            {difference && <FontIcon
                className='text-warning metric-box-arrowIcon'
                icon={difference > 0 ? IconNames.ARROW_UP : IconNames.ARROW_DOWN}
                size={12}
            />
            }
        </span>
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    notifications: PropTypes.number,
    sampleSize: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    warnings: PropTypes.number,
    difference: PropTypes.number
};

export default MetricInfoBox;
