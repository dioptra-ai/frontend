import PropTypes from 'prop-types';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const ProgressBar = ({completed}) => {
    return (
        <OverlayTrigger overlay={
            <Tooltip>{completed}%</Tooltip>
        }>
            <div
                className='bg-light-blue cursor-pointer'
                style={{height: 10, width: '100%', borderRadius: 2, overflow: 'hidden'}}
            >
                <div
                    className='bg-primary'
                    style={{height: '100%', width: `${completed}%`}}
                ></div>
            </div>
        </OverlayTrigger>
    );
};

ProgressBar.propTypes = {
    completed: PropTypes.number
};

export default ProgressBar;
