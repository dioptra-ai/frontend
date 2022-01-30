import UnsupervisedObjectDetection from './unsupervised-object-detection';
import useModel from 'hooks/use-model';

const Predictions = (props) => {
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
        return null;
    }
};

export default Predictions;
