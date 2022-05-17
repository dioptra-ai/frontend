import useModel from 'hooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import Classifier from './classifier';

const Predictions = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
    case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
        return <Classifier {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    // case 'SPEECH_TO_TEXT':
    default:
        return null;
    }
};

export default Predictions;
