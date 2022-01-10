import {setupComponent} from 'helpers/component-helper';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';

const FeatureAnalysis = () => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':

        return <FeatureAnalysisImages/>;
    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    case 'TEXT_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    default:
        console.log('throwing unknown model type error');
        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default setupComponent(FeatureAnalysis);
