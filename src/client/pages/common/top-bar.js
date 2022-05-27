import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {IoRefreshSharp} from 'react-icons/io5';
import {BsCart4} from 'react-icons/bs';
import {Link} from 'react-router-dom';

import DateTimeRangePicker from 'components/date-time-range-picker';
import {setupComponent} from 'helpers/component-helper';

const TopBar = ({showTimePicker, timeStore, userStore}) => {

    return (
        <div className='py-2 px-3 d-flex align-items-center justify-content-end border-bottom'>
            {showTimePicker ? null : (
                <>
                    <DateTimeRangePicker
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
            <div className='position-relative click-down'>
                {
                    userStore.userData.cart.length ? (
                        <div className='position-absolute fs-5 w-100 text-center text-dark' style={{top: -16}}>
                            {userStore.userData.cart.length}
                        </div>
                    ) : null
                }
                <Link to='/cart'>
                    <BsCart4 className='fs-3 text-dark'/>
                </Link>
            </div>
        </div>
    );
};

TopBar.propTypes = {
    showTimePicker: PropTypes.bool,
    timeStore: PropTypes.object,
    userStore: PropTypes.object
};

export default setupComponent(TopBar);
