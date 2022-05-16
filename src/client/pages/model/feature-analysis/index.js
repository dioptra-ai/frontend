import useModel from 'hooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import FeatureAnalysisText from './feature-analysis-text';

const FeatureAnalysis = () => {
    const model = useModel();

    // Break this down into one file for each model type
    // when this gets more complicated.
    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':
    case 'UNSUPERVISED_OBJECT_DETECTION':
    case 'MULTIPLE_OBJECT_TRACKING':

        return <FeatureAnalysisImages/>;
    case 'TEXT_CLASSIFIER':
    case 'Q_N_A':
    case 'SPEECH_TO_TEXT':
    case 'AUTO_COMPLETION':
    case 'SEMANTIC_SIMILARITY':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
        return <FeatureAnalysisText/>;
    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    default:
        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default FeatureAnalysis;
