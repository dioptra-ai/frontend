import PropTypes from 'prop-types';
import {IoFilterCircleOutline} from 'react-icons/io5';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {setupComponent} from 'helpers/component-helper';
import {Filter} from 'state/stores/filters-store';

const AddFilters = ({filtersStore, filters, disabled}) => {
    const displayFilter = filters.map((f) => f.toString()).join(', ');

    return (
        <OverlayTrigger
            overlay={
                <Tooltip>
                    Filter the current view with {displayFilter.substring(0, 50)}{displayFilter.length > 50 ? '...' : ''}
                </Tooltip>
            }
        >
            <button
                className={`${disabled ? 'disabled' : ''} text-dark border-0 bg-transparent click-down fs-2`}
                title='Filter down'
                onClick={() => {

                    filtersStore.addFilters(filters);
                }}
            >
                <IoFilterCircleOutline/>
            </button>
        </OverlayTrigger>
    );
};

AddFilters.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.instanceOf(Filter)).isRequired,
    disabled: PropTypes.bool
};

export default setupComponent(AddFilters);
