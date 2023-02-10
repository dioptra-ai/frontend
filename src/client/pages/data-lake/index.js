import PropTypes from 'prop-types';

import DatapointsViewer from 'components/datapoints-viewer';
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
                <div className='my-3'>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                </div>
                <DatapointsViewer filters={allFilters} onSelectedDatapointsChange={console.log}/>
            </div>
        </Menu>
    );
};

DataLake.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(DataLake);
