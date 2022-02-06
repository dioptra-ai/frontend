import PropTypes from 'prop-types';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoInformationCircleOutline} from 'react-icons/io5';
import {Textfit} from 'react-textfit';

import DifferenceLabel from 'components/difference-labels';

const MetricInfoBox = ({value, name, subtext, info, unit = '', difference, children}) => (
    <div className='border rounded p-3 w-100 d-flex flex-column align-items-center justify-content-center metric-box'>
        <div className='d-flex flex-wrap align-items-baseline justify-content-between'>
            <div>
                <span className='text-dark-bold bold-text text-nowrap'>{name}</span>
                {subtext && <span className='text-primary mx-1' style={{fontSize: '70%'}}>{subtext}</span>}
            </div>
            <div>
                {info ? (

                    <OverlayTrigger overlay={(
                        <Tooltip>{info}</Tooltip>
                    )}>
                        <IoInformationCircleOutline/>
                    </OverlayTrigger>
                ) : null}
            </div>
        </div>
        <span className='text-dark w-100'>
            <Textfit mode='single' max={50}>
                {
                    children || `${!isNaN(value) ? Number(value).toFixed(2) : '-'}${unit}`
                }
            </Textfit>
        </span>
        {difference !== undefined ? (
            <DifferenceLabel difference={!isNaN(difference) ? Number(difference).toFixed(2) : '-'}/>
        ) : null}
    </div>
);

MetricInfoBox.propTypes = {
    name: PropTypes.string,
    subtext: PropTypes.any,
    unit: PropTypes.string,
    value: PropTypes.number,
    difference: PropTypes.number,
    children: PropTypes.node,
    info: PropTypes.node
};

export default MetricInfoBox;
