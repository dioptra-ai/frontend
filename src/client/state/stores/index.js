import {modelStore} from './model-store';
import {errorStore} from './error-store';
import {timeStore} from './time-store';
import {filtersStore} from './filters-store';
import {authStore} from './auth-store';
import {segmentationStore} from './segmentation';
import {benchmarkStore} from './benchmark-store';
import {datasetStore} from './dataset-store';

const initializeStores = async () => {
    const readyStatuses = await Promise.all(Object.values(stores).map((store) => {

        return store.initialize?.() || true;
    }));

    return readyStatuses.every((r) => r);
};

const stores = {
    modelStore,
    errorStore,
    timeStore,
    filtersStore,
    authStore,
    segmentationStore,
    benchmarkStore,
    datasetStore,
    initializeStores
};

export default stores;
