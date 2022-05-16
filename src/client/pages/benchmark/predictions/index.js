import useModel from 'hooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import TextClassifier from './text-classifier';
import ImageClassifier from './image-classifier';

const Predictions = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':

        return <ImageClassifier {...props}/>;
    // case 'TABULAR_CLASSIFIER':
    // case 'DOCUMENT_PROCESSING':
    // case 'Q_N_A':
    case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':

        return <TextClassifier {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    // case 'SPEECH_TO_TEXT':
    default:
        return null;
    }
};

export default Predictions;
