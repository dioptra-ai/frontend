import useModel from 'hooks/use-model';
import DocumentProcessing from './document-processing';
import ImageClassifier from './image-classifier';
import QNA from './q-n-a';
import SpeechToText from './speech-to-text';
import TabularClassifier from './tabular-classifier';
import TextClassifier from './text-classifier';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import MultipleObjectTracking from './multiple-object-tracking';

const PredictionAnalysis = (props) => {
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
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;

    case 'MULTIPLE_OBJECT_TRACKING':

        return <MultipleObjectTracking/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    default:

        return null;
    }
};

export default PredictionAnalysis;
