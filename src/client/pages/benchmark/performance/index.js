import useModel from 'customHooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import SpeechToText from './speech-to-text';

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
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    default:

        return null;
    }
};

export default Performance;
