import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import DifferenceLabel from './difference-labels';

const MetricInfoBox = ({value, notifications, warnings, name, sampleSize, unit, difference = 0}) => (
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
        <DifferenceLabel value={`${!isNaN(value) ? value.toFixed(1) : '-'}${unit}`} difference={!isNaN(difference) ? difference.toFixed(2) : '-'} baseClasses='text-dark metric-box-font-60' />
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
