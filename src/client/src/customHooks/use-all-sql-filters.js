import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore, authStore, iouStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const organizationId = authStore.userData.activeOrganizationMembership?.organization._id;
    const {mlModelId, mlModelType} = modelStore.getModelById(activeModelId);

    const iouFilter = mlModelType === 'DOCUMENT_PROCESSING' ? `iou >= ${iouStore.iou}` : 'TRUE';

    if (mlModelId) {
        const timeFilter = useReferenceRange ? modelStore.getSqlReferencePeriodFilter(activeModelId) : timeStore.sqlTimeFilter;

        return `${timeFilter} AND ${filtersStore.sqlFilters} AND organization_id='${organizationId}' AND model_id='${mlModelId}' AND ${iouFilter}`;
    } else {
        return `${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters} AND organization_id='${organizationId}' AND ${iouFilter}`;
    }

};

export default useAllSqlFilters;
