import useModel from 'customHooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
// TODO: remove this when all types are coded up
import PerformanceDetails from 'pages/templates/model-template/performance-details';

const Performance = (props) => {
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

        return <PerformanceDetails {...props}/>;
    }
};

export default Performance;
