import {modelStore} from './model-store';
import {errorStore} from './error-store';
import {timeStore} from './time-store';
import {filtersStore} from './filters-store';
import {userStore} from './user-store';
import {segmentationStore} from './segmentation';
import {benchmarkStore} from './benchmark-store';
import {chatStore} from './chat';

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
    userStore,
    segmentationStore,
    benchmarkStore,
    chatStore,
    initializeStores
};

export default stores;
