import useModel from 'hooks/use-model';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import SpeechToText from './speech-to-text';
import AutoCompletion from './auto-completion';
import QnA from './q-n-a';
import TextClassifier from './text-classifier';
import ImageClassifier from './image-classifier';

const Features = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
        return <ImageClassifier {...props}/>;
    // case 'TABULAR_CLASSIFIER':
    // case 'DOCUMENT_PROCESSING':
    case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
        return <TextClassifier {...props}/>;
    case 'Q_N_A':

        return <QnA {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    case 'AUTO_COMPLETION':

        return <AutoCompletion {...props}/>;
    default:

        return null;
    }
};

export default Features;
