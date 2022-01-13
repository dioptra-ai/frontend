import PropTypes from 'prop-types';
import {IoFilterCircleOutline} from 'react-icons/io5';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {setupComponent} from 'helpers/component-helper';
import {Filter} from 'state/stores/filters-store';

const AddFilters = ({filtersStore, filters}) => (
    <OverlayTrigger
        overlay={
            <Tooltip>
                Filter the current view with
                {
                    filters.length > 5 ? ` ${filters.length} more filters.` : (
                        <>
                            <br/>
                            {filters.map((f) => `${f.key}: ${f.value}`).join(', ')}
                        </>
                    )
                }
            </Tooltip>
        }
    >
        <button
            className='text-dark border-0 bg-transparent click-down fs-2'
            title='Filter down'
            onClick={() => {

                filtersStore.addFilters(filters);
            }}
        >
            <IoFilterCircleOutline/>
        </button>
    </OverlayTrigger>
);

AddFilters.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.instanceOf(Filter)).isRequired
};

export default setupComponent(AddFilters);
