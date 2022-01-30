import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {modelStore, filtersStore} = stores;

const useModel = () => {
    const modelIdFromPath = useParams()._id;

    if (modelIdFromPath) {

        return modelStore.getModelById(modelIdFromPath);
    } else {
        const mlModelIdFromFilters = filtersStore.filters.find((f) => f.left === 'model_id').right;

        return modelStore.models.find((m) => m.mlModelId === mlModelIdFromFilters);
    }
};

export default useModel;
