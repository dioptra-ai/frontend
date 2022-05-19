import PropTypes from 'prop-types';

import Menu from 'components/menu';
import Async from 'components/async';
import GeneralSearchBar from 'pages/common/general-search-bar';
import FilterInput from 'pages/common/filter-input';
import baseJSONClient from 'clients/base-json-client';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import {setupComponent} from 'helpers/component-helper';
import SamplesPreview from 'components/samples-preview';

const Sandbox = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();

    useSyncStoresToUrl(({filtersStore, segmentationStore, timeStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    return (
        <Menu>
            <GeneralSearchBar/>
            <div className='text-dark p-2'>
                <div style={{fontSize: 24}}>
                    Sandbox
                </div>
                <div className='bg-white'>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                    <Async
                        fetchData={() => baseJSONClient('/api/metrics/sandbox-analysis', {
                            method: 'post',
                            body: {
                                sql_filters: allSqlFilters
                            }
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={(samples) => (
                            <SamplesPreview samples={samples}/>
                        )}
                    />
                </div>
            </div>
        </Menu>
    );
};

Sandbox.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(Sandbox);
