import useModel from 'hooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import SpeechToText from './speech-to-text';
import QnA from './q-n-a';
import TextClassifier from './text-classifier';

const Performance = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    // case 'IMAGE_CLASSIFIER':
    // case 'TABULAR_CLASSIFIER':
    // case 'DOCUMENT_PROCESSING':
    // case 'Q_N_A':
    case 'TEXT_CLASSIFIER':

        return <TextClassifier {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    case 'Q_N_A':

        return <QnA {...props}/>;
    default:

        return null;
    }
};

export default Performance;
