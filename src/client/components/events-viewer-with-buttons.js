import {useState} from 'react';
import PropTypes from 'prop-types';
import {BsCartPlus} from 'react-icons/bs';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoCloseOutline} from 'react-icons/io5';

import {Filter} from 'state/stores/filters-store';
import AddFilters from 'components/add-filters';
import EventsViewer from 'components/events-viewer';
import {setupComponent} from 'helpers/component-helper';

const EventsViewerWithButtons = ({samples, userStore, onClearSamples, limit}) => {
    const [selectedSamples, setSelectedSamples] = useState(new Set());
    const selectedUUIDs = samples.map(({uuid}) => uuid).filter((u) => selectedSamples.has(u));

    return (
        <>
            <div className='d-flex justify-content-end'>
                {onClearSamples ? (
                    <OverlayTrigger overlay={<Tooltip>Clear Selected Samples</Tooltip>}>
                        <button
                            disabled={!selectedSamples.size}
                            className='d-flex text-dark border-0 bg-transparent click-down' onClick={() => onClearSamples(selectedUUIDs)}>
                            <IoCloseOutline className='fs-2 cursor-pointer'/>
                        </button>
                    </OverlayTrigger>
                ) : null}
                <AddFilters
                    disabled={!selectedSamples.size}
                    filters={[new Filter({
                        left: 'uuid',
                        op: 'in',
                        right: selectedUUIDs
                    })]}
                    tooltipText={`Filter ${selectedSamples.size} In`}
                />
                <AddFilters
                    disabled={!selectedSamples.size}
                    filters={[new Filter({
                        left: 'uuid',
                        op: 'not in',
                        right: selectedUUIDs
                    })]}
                    tooltipText={`Filter ${selectedSamples.size} Out`}
                    solidIcon
                />
                <OverlayTrigger overlay={<Tooltip>Add {selectedSamples.size} to Data Cart</Tooltip>}>
                    <button
                        disabled={!selectedSamples.size}
                        className='d-flex text-dark border-0 bg-transparent click-down fs-2' onClick={() => {

                            userStore.tryUpdate({
                                cart: userStore.userData.cart.concat(...selectedUUIDs)
                            });
                        }}>
                        <BsCartPlus className='fs-2 ps-2 cursor-pointer'/>
                    </button>
                </OverlayTrigger>
            </div>
            <EventsViewer
                events={samples}
                onSelectedUUIDsChange={setSelectedSamples}
                onClearDatapoint={onClearSamples ? (uuid) => onClearSamples([uuid]) : null}
                limit={limit}
            />
        </>
    );
};

EventsViewerWithButtons.propTypes = {
    samples: PropTypes.arrayOf(PropTypes.object).isRequired,
    userStore: PropTypes.object.isRequired,
    onClearSamples: PropTypes.func,
    limit: PropTypes.number
};

export default setupComponent(EventsViewerWithButtons);
