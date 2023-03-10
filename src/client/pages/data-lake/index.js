import PropTypes from 'prop-types';
import {useHistory} from 'react-router-dom';

import baseJSONClient from 'clients/base-json-client';
import DatapointsViewer from 'components/datapoints-viewer';
import useAllFilters from 'hooks/use-all-filters';
import Menu from 'components/menu';
import DatasetSelector from 'pages/dataset/dataset-selector';
import TopBar from 'pages/common/top-bar';
import FilterInput from 'pages/common/filter-input';
import {setupComponent} from 'helpers/component-helper';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';

const DataLake = ({filtersStore}) => {
    const allFilters = useAllFilters({excludeCurrentTimeFilters: true});
    const history = useHistory();

    useSyncStoresToUrl(({filtersStore}) => ({
        filters: JSON.stringify(filtersStore.filters)
    }));

    return (
        <Menu>
            <TopBar hideTimePicker />
            <div className='text-dark p-3'>
                <h4>Data Lake</h4>
                <div className='my-3'>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                </div>
                <DatapointsViewer filters={allFilters} renderActionButtons={({selectedDatapoints}) => selectedDatapoints.size ? (
                    <DatasetSelector allowNew title='Add selected to dataset' onChange={async (datasetId) => {
                        await baseJSONClient.post(`/api/dataset/${datasetId}/add`, {datapointIds: Array.from(selectedDatapoints)});
                        history.push(`/dataset/${datasetId}`);
                    }}>
                        Add selected to dataset
                    </DatasetSelector>
                ) : null} />
            </div>
        </Menu>
    );
};

DataLake.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(DataLake);
