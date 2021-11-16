import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore, iouStore} = stores;

const useAllSqlFilters = ({useReferenceRange = false} = {}) => {
    const params = useParams();
    const activeModelId = params._id;
    const {mlModelId, mlModelType} = modelStore.getModelById(activeModelId);
    const allFilters = [];

    if (mlModelType === 'DOCUMENT_PROCESSING') {
        allFilters.push(`iou >= ${iouStore.iou}`);
    }

    if (mlModelId) {
        allFilters.push(`model_id='${mlModelId}'`);

        if (useReferenceRange) {
            allFilters.push(modelStore.getSqlReferencePeriodFilter(activeModelId));
        } else {
            allFilters.push(timeStore.sqlTimeFilter);
        }

        allFilters.push(filtersStore.sqlFilters);
    } else {
        allFilters.push(timeStore.sqlTimeFilter);

        allFilters.push(filtersStore.sqlFilters);
    }

    return allFilters.join(' AND ');
};

export default useAllSqlFilters;
