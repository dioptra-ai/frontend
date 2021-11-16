import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore, iouStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const {mlModelId, mlModelType} = modelStore.getModelById(activeModelId);

    const iouFilter = mlModelType === 'DOCUMENT_PROCESSING' ? `iou >= ${iouStore.iou}` : 'TRUE';

    if (mlModelId) {
        const timeFilter = useReferenceRange ? modelStore.getSqlReferencePeriodFilter(activeModelId) : timeStore.sqlTimeFilter;

        return `${timeFilter} AND ${filtersStore.sqlFilters} AND model_id='${mlModelId}' AND ${iouFilter}`;
    } else {
        return `${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters} AND ${iouFilter}`;
    }

};

export default useAllSqlFilters;
