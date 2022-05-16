import useModel from 'hooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import UnsupervisedClassifier from './unsupervised-classifier';
import SpeechToText from './speech-to-text';
import AutoCompletion from './auto-completion';
import QnA from './q-n-a';
import TextClassifier from './text-classifier';
import ImageClassifier from './image-classifier';

const Performance = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <ImageClassifier {...props}/>;
    // case 'TABULAR_CLASSIFIER':
    // case 'DOCUMENT_PROCESSING':
    // case 'Q_N_A':
    case 'TEXT_CLASSIFIER':
        return <TextClassifier {...props}/>;
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
        return <UnsupervisedClassifier {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    case 'AUTO_COMPLETION':

        return <AutoCompletion {...props}/>;
    case 'Q_N_A':

        return <QnA {...props}/>;
    default:

        return null;
    }
};

export default Performance;
