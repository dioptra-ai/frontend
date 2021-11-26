import {setupComponent} from 'helpers/component-helper';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import FeatureAnalysisUnstructuredData from './unstructured-data';

const FeatureAnalysis = () => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':

        return <FeatureAnalysisImages model={model}/>;
    case 'TABULAR_CLASSIFIER':
        return <FeatureIntegrityTable model={model}/>;
    case 'Q_N_A':
        return <FeatureAnalysisUnstructuredData/>;
    default:

        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default setupComponent(FeatureAnalysis);
