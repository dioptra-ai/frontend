import {useContext} from 'react';

import useStores from 'hooks/use-stores';
import useBenchmark from 'hooks/use-benchmark';
import appContext from 'context/app-context';

const useModel = (modelNum = 0) => {
    const {isModelView} = useContext(appContext);

    if (isModelView) {
        const {filtersStore, modelStore} = useStores();
        const currentModelFilter = filtersStore.models[modelNum];

        return modelStore.getModelById(currentModelFilter._id);
    } else {

        const {modelStore} = useStores();
        const benchmark = useBenchmark();
        const mlModelId = benchmark['model_id'];

        return modelStore.getModelByMlModelId(mlModelId);
    }
};

export default useModel;
