import {useContext} from 'react';

import useBenchmark from 'hooks/use-benchmark';
import appContext from 'context/app-context';
import comparisonContext from 'context/comparison-context';
import stores from 'state/stores';

const useModel = () => {
    const {isModelView} = useContext(appContext);

    if (isModelView) {
        const {filtersStore, modelStore} = stores;
        const comparisonContextValue = useContext(comparisonContext);
        const comparisonIndex = comparisonContextValue?.index || 0;
        const currentModelFilter = filtersStore.models[comparisonIndex];

        return modelStore.getModelById(currentModelFilter._id);
    } else {

        const {modelStore} = stores;
        const benchmark = useBenchmark();
        const mlModelId = benchmark['model_id'];

        return modelStore.getModelByMlModelId(mlModelId);
    }
};

export default useModel;
