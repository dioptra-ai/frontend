import {setupComponent} from 'helpers/component-helper';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';

const FeatureAnalysis = () => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <FeatureAnalysisImages model={model}/>;
    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable model={model}/>;
    default:

        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default setupComponent(FeatureAnalysis);
