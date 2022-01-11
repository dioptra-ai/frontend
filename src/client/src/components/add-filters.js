import PropTypes from 'prop-types';
import {IoFilterCircleOutline} from 'react-icons/io5';

import {setupComponent} from 'helpers/component-helper';

const AddFilters = ({filtersStore, filters}) => (
    <button
        className='text-dark border-0 bg-white fs-2'
        title='Filter down'
        onClick={() => {

            filtersStore.addFilters(filters);
        }}
    >
        <IoFilterCircleOutline/>
    </button>
);

AddFilters.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default setupComponent(AddFilters);
