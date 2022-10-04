import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {IoRefreshSharp} from 'react-icons/io5';
import {BsCart4} from 'react-icons/bs';
import {Link} from 'react-router-dom';

import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';

const TopBar = ({hideTimePicker, timeStore, userStore}) => {

    return (
        <div className='py-2 px-3 d-flex align-items-center justify-content-end border-bottom'>
            {hideTimePicker ? null : (
                <>
                    <DateTimeRangePicker
                        jumpToLatestDataPopup
                        end={timeStore.end}
                        onChange={({start, end, lastMs}) => {
                            if (lastMs) {
                                timeStore.setLastMs(lastMs);
                            } else {
                                timeStore.setTimeRange({start, end});
                            }
                        }}
                        start={timeStore.start}
                    />
                    <Button
                        className='d-flex align-items-center justify-content-between px-2 py-2 ms-1 me-3 btn-secondary'
                        disabled={!timeStore.lastMs}
                        onClick={() => timeStore.refreshTimeRange()}
                        variant='primary'
                    >
                        <IoRefreshSharp className='fs-4 text-dark'/>
                    </Button>
                </>
            )}
            <Link to='/cart'>
                <div className='position-relative click-down btn px-2'>
                    {
                        userStore.userData.cart.length ? (
                            <div className='position-absolute fs-5 w-100 text-center text-dark' style={{top: -8, left: 0}}>
                                {userStore.userData.cart.length}
                            </div>
                        ) : null
                    }
                    <BsCart4 className='fs-3 text-dark'/>
                </div>
            </Link>
        </div>
    );
};

TopBar.propTypes = {
    hideTimePicker: PropTypes.bool,
    timeStore: PropTypes.object,
    userStore: PropTypes.object
};

export default setupComponent(TopBar);
