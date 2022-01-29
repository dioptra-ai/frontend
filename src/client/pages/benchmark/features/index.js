import useModel from 'customHooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
// TODO: remove this when all types are coded up
import FeatureAnalysis from 'pages/templates/model-template/feature-analysis';

const Features = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    // case 'IMAGE_CLASSIFIER':
    // case 'TABULAR_CLASSIFIER':
    // case 'DOCUMENT_PROCESSING':
    // case 'Q_N_A':
    // case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    // case 'SPEECH_TO_TEXT':
    default:

        return <FeatureAnalysis {...props}/>;
    }
};

export default Features;
