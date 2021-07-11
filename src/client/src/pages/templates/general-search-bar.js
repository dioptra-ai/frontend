import React from 'react';
import FontIcon from '../../components/font-icon';
import {IconNames} from '../../constants';
import {Button, FormText} from 'react-bootstrap';
import DateTimeRangePicker from '../../components/date-time-range-picker';
import PropTypes from 'prop-types';

const GeneralSearchBar = ({shouldShowOnlySearchInput}) => {
    return (
        <div className='py-3 px-4 d-flex align-items-center border-bottom'>
            <FontIcon className='text-secondary' icon={IconNames.SEARCH} size={25}/>
            <div className='flex-grow-1 mx-3'>
                <FormText as='input' className='form-control border-0 py-3' placeholder='Search'/>
            </div>
            {shouldShowOnlySearchInput ? null :
                <>
                    <DateTimeRangePicker />
                    <Button className='text-white d-flex align-items-center justify-content-between px-4 ms-3' variant='primary'>
                        <FontIcon className='text-white m-2' icon={IconNames.REFRESH} size={15}/>
                        <span>REFRESH</span>
                    </Button>
                </>
            }
        </div>
    );
};

GeneralSearchBar.propTypes = {
    shouldShowOnlySearchInput: PropTypes.bool
};

export default GeneralSearchBar;
