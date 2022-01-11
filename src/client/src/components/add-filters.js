import PropTypes from 'prop-types';
import {IoFilterCircleOutline} from 'react-icons/io5';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';

import {setupComponent} from 'helpers/component-helper';

const AddFilters = ({filtersStore, filters}) => (
    <OverlayTrigger
        overlay={
            <BootstrapTooltip>
                Filter the current view with
                {
                    filters.length > 5 ? ` ${filters.length} more filters.` : (
                        <>
                            <br/>
                            {filters.map((f) => `${f.key}: ${f.value}`).join(', ')}
                        </>
                    )
                }
            </BootstrapTooltip>
        }
    >
        <button
            className='text-dark border-0 bg-transparent fs-2'
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
    filters: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default setupComponent(AddFilters);
