import React from 'react';
import {IconNames} from 'constants';
import {Button} from 'react-bootstrap';
import PropTypes from 'prop-types';

import FontIcon from 'components/font-icon';
import DateTimeRangePicker from 'components/date-time-range-picker';
import TextInput from 'components/text-input';
import {setupComponent} from 'helpers/component-helper';

const GeneralSearchBar = ({shouldShowOnlySearchInput, timeStore}) => {

    return (
        <div className='py-3 px-4 d-flex align-items-center border-bottom'>
            <FontIcon className='text-secondary' icon={IconNames.SEARCH} size={25}/>
            <div className='flex-grow-1 mx-3'>
                <TextInput className='form-control border-0 py-3' placeholder='Search'/>
            </div>
            {shouldShowOnlySearchInput ? null :
                <>
                    <DateTimeRangePicker
                        end={timeStore.end}
                        onChange={({start, end}) => timeStore.setTimeRange({start, end})}
                        start={timeStore.start}
                    />
                    <Button
                        className='text-white d-flex align-items-center justify-content-between px-4 py-2 ms-3' disabled={!timeStore.refreshable}
                        onClick={() => timeStore.refreshTimeRange()}
                        variant='primary'
                    >
                        <FontIcon className='text-white m-2' icon={IconNames.REFRESH} size={15}/>
                        <span>REFRESH</span>
                    </Button>
                </>
            }
        </div>
    );
};

GeneralSearchBar.propTypes = {
    shouldShowOnlySearchInput: PropTypes.bool,
    timeStore: PropTypes.object
};

export default setupComponent(GeneralSearchBar);
