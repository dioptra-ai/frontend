import PropTypes from 'prop-types';

import {SpinnerWrapper} from 'components/spinner';
import DifferenceLabel from './difference-labels';

const MetricInfoBox = ({value, name, subtext, unit = '', difference}) => (
    <div className='border rounded p-3 w-100 d-flex flex-column align-items-center justify-content-center metric-box'>
        <SpinnerWrapper>
            <div className='d-flex flex-wrap align-items-baseline'>
                <span className='text-dark-bold bold-text'>{name}</span>
                {subtext && <span className='text-primary mx-1' style={{fontSize: '70%'}}>{subtext}</span>}
            </div>
            <span className='text-dark metric-box-font-60'>{`${!isNaN(value) ? Number(value).toFixed(1) : '-'}${unit}`}</span>
            {difference !== undefined ? (
                <DifferenceLabel difference={!isNaN(difference) ? Number(difference).toFixed(2) : '-'}/>
            ) : null}
        </SpinnerWrapper>
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    subtext: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    difference: PropTypes.number
};

export default MetricInfoBox;
