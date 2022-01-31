import useModel from 'hooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';

const FeatureAnalysis = () => {
    const model = useModel();

    // Break this down into one file for each model type
    // when this gets more complicated.
    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':
    case 'UNSUPERVISED_OBJECT_DETECTION':
    case 'SPEECH_TO_TEXT':

        return <FeatureAnalysisImages/>;
    case 'TABULAR_CLASSIFIER':
    case 'TEXT_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    default:
        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default FeatureAnalysis;
