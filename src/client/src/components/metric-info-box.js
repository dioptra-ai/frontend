import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import FontIcon from 'components/font-icon';
import {IconNames} from 'constants';
import DifferenceLabel from './difference-labels';
import {SpinnerWrapper} from 'components/spinner';

const MetricInfoBox = ({value, notifications, warnings, name, subtext, unit = '', difference}) => (
    <div className='border rounded p-3 w-100 d-flex flex-column align-items-center justify-content-center metric-box'>
        <SpinnerWrapper>
            <div className='d-flex flex-wrap'>
                <span className='text-dark-bold bold-text'>{name}</span>
                {subtext && <span className='text-primary mx-1'>{subtext}</span>}
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
            <DifferenceLabel value={`${!isNaN(value) ? Number(value).toFixed(1) : '-'}${unit}`} difference={!isNaN(difference) ? Number(difference).toFixed(2) : '-'} baseClasses='text-dark metric-box-font-60' />
        </SpinnerWrapper>
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    notifications: PropTypes.number,
    subtext: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    warnings: PropTypes.number,
    difference: PropTypes.number
};

export default MetricInfoBox;
