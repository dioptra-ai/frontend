import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore, authStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const organizationId = authStore.userData.activeOrganizationMembership?.organization._id;

    if (activeModelId) {
        const activeModel = modelStore.getModelById(activeModelId);
        const timeFilter = useReferenceRange ? modelStore.getSqlReferencePeriodFilter(activeModelId) : timeStore.sqlTimeFilter;

        return `${timeFilter} AND ${filtersStore.sqlFilters} AND organization_id='${organizationId}'` +
               ` AND ${activeModelId ? `model_id='${activeModel.mlModelId}'` : 'TRUE'}`;
    } else {

        return `${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters} AND organization_id='${organizationId}'`;
    }

};

export default useAllSqlFilters;
