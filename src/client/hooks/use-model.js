import {useContext} from 'react';

import useBenchmark from 'hooks/use-benchmark';
import appContext from 'context/app-context';
import comparisonContext from 'context/comparison-context';
import stores from 'state/stores';

const useModel = () => {
    const {isModelView, isBenchmarkView} = useContext(appContext);

    if (isModelView) {
        const {filtersStore, modelStore} = stores;
        const comparisonContextValue = useContext(comparisonContext);
        const comparisonIndex = comparisonContextValue?.index || 0;
        const currentModelFilter = filtersStore.models[comparisonIndex];

        if (currentModelFilter.mlModelId) {

            return modelStore.getModelByMlModelId(currentModelFilter.mlModelId);
        } else {

            return modelStore.getModelById(currentModelFilter._id);
        }
    } else if (isBenchmarkView) {

        const {modelStore} = stores;
        const benchmark = useBenchmark();
        const mlModelId = benchmark['model_id'];

        return modelStore.getModelByMlModelId(mlModelId);
    } else {

        return null;
    }
};

export default useModel;
