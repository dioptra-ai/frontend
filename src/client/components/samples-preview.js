import oHash from 'object-hash';
import {useState} from 'react';
import PropTypes from 'prop-types';
import {BsCartPlus} from 'react-icons/bs';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {Filter} from 'state/stores/filters-store';
import AddFilters from 'components/add-filters';
import DatapointsViewer from 'components/datapoints-viewer';
import {setupComponent} from 'helpers/component-helper';

const SamplesPreview = ({samples, userStore}) => {
    const [selectedSamples, setSelectedSamples] = useState(new Set());
    const sampleUUIDs = samples.filter((_, i) => selectedSamples.has(i)).map(({uuid}) => uuid);

    return (
        <>
            <div className='text-dark m-0 bold-text d-flex justify-content-between'>
                <div>
                    {samples.length ? `Samples: ${samples.length}` : null}
                </div>
                <div>
                    <AddFilters
                        disabled={!selectedSamples.size}
                        filters={[new Filter({
                            left: 'uuid',
                            op: 'in',
                            right: sampleUUIDs
                        })]}
                        tooltipText={`Filter ${selectedSamples.size} In`}
                    />
                    <AddFilters
                        disabled={!selectedSamples.size}
                        filters={[new Filter({
                            left: 'uuid',
                            op: 'not in',
                            right: sampleUUIDs
                        })]}
                        tooltipText={`Filter ${selectedSamples.size} Out`}
                        solidIcon
                    />
                    <OverlayTrigger overlay={<Tooltip>Add {selectedSamples.size} to Data Cart</Tooltip>}>
                        <button
                            disabled={!selectedSamples.size}
                            className='text-dark border-0 bg-transparent click-down fs-2' onClick={() => {

                                userStore.tryUpdate({
                                    cart: userStore.userData.cart.concat(...sampleUUIDs)
                                });
                            }}>
                            <BsCartPlus className='fs-2 ps-2 cursor-pointer'/>
                        </button>
                    </OverlayTrigger>
                </div>
            </div>
            <DatapointsViewer
                datapoints={samples}
                onSelectedChange={setSelectedSamples}
                key={oHash(samples)}
            />
        </>
    );
};

SamplesPreview.propTypes = {
    samples: PropTypes.arrayOf(PropTypes.object).isRequired,
    userStore: PropTypes.object.isRequired
};

export default setupComponent(SamplesPreview);
