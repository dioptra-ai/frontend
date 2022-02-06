import PropTypes from 'prop-types';
import {IoFilterCircle, IoFilterCircleOutline} from 'react-icons/io5';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {setupComponent} from 'helpers/component-helper';
import {Filter} from 'state/stores/filters-store';

const AddFilters = ({filtersStore, filters, disabled, solidIcon, tooltipText}) => {
    const displayFilter = filters.map((f) => f.toString()).join(', ');

    return (
        <OverlayTrigger overlay={
            <Tooltip>
                {
                    tooltipText || `Filter the current view with ${displayFilter.substring(0, 50)}${displayFilter.length > 50 ? '...' : ''}`
                }
            </Tooltip>
        }>
            <button
                className={`${disabled ? 'disabled' : ''} text-dark border-0 bg-transparent click-down fs-2`}
                onClick={() => {

                    filtersStore.addFilters(filters);
                }}
            >
                {solidIcon ? <IoFilterCircle/> : <IoFilterCircleOutline/>}
            </button>
        </OverlayTrigger>
    );
};

AddFilters.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.instanceOf(Filter)).isRequired,
    disabled: PropTypes.bool,
    solidIcon: PropTypes.bool,
    tooltipText: PropTypes.node
};

export default setupComponent(AddFilters);
