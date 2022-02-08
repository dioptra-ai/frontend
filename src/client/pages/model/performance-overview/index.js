import useModel from 'hooks/use-model';
import DocumentProcessing from './document-processing';
import ImageClassifier from './image-classifier';
import QNA from './q-n-a';
import SpeechToText from './speech-to-text';
import TabularClassifier from './tabular-classifier';
import TextClassifier from './text-classifier';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import AutoCompletion from './auto-completion';

const PerformanceOverview = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <ImageClassifier/>;
    case 'TABULAR_CLASSIFIER':

        return <TabularClassifier/>;
    case 'DOCUMENT_PROCESSING':

        return <DocumentProcessing/>;
    case 'Q_N_A':

        return <QNA/>;
    case 'TEXT_CLASSIFIER':

        return <TextClassifier/>;
    case 'AUTO_COMPLETION':

        return <AutoCompletion/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    default:

        return null;
    }
};

export default PerformanceOverview;
