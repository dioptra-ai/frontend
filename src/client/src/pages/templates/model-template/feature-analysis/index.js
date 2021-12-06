import {setupComponent} from 'helpers/component-helper';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import FeatureAnalysisText from './feature-analysis-text';

const FeatureAnalysis = () => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':

        return <FeatureAnalysisImages/>;
    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    case 'TEXT_CLASSIFIER':

        return <FeatureAnalysisText/>;
    default:

        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default setupComponent(FeatureAnalysis);
