import PropTypes from 'prop-types';

import DatapointsViewerWithButtons from 'components/datapoints-viewer-with-buttons';
import useAllFilters from 'hooks/use-all-filters';
import Menu from 'components/menu';
import TopBar from 'pages/common/top-bar';
import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';

const DataLake = ({filtersStore}) => {
    const allFilters = useAllFilters({excludeCurrentTimeFilters: true});

    useSyncStoresToUrl(({filtersStore}) => ({
        filters: JSON.stringify(filtersStore.filters)
    }));

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='text-dark p-3'>
                <h4>
                    Data Lake
                </h4>
                <div className='m-3'>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                </div>
                <DatapointsViewerWithButtons filters={allFilters} />
            </div>
        </Menu>
    );
};

DataLake.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(DataLake);
