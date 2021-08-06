import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {filtersStore, timeStore, modelStore} = stores;

const useAllSqlFilters = () => {
    const params = useParams();
    const activeModelId = params._id;

    if (activeModelId) {
        const activeModel = modelStore.getModelById(activeModelId);

        return `${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters} AND ${activeModelId ? `model_id='${activeModel.mlModelId}'` : 'TRUE'}`;
    } else {

        return `${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}`;
    }

};

export const useAllButTime = () => {
    const params = useParams();
    const activeModelId = params._id;

    if (activeModelId) {
        const activeModel = modelStore.getModelById(activeModelId);

        return `${filtersStore.sqlFilters} AND ${activeModelId ? `model_id='${activeModel.mlModelId}'` : 'TRUE'}`;
    } else {

        return `${filtersStore.sqlFilters}`;
    }
};

export default useAllSqlFilters;
