import useModel from 'hooks/use-model';
import DocumentProcessing from './document-processing';
import ImageClassifier from './image-classifier';
import QNA from './q-n-a';
import SpeechToText from './speech-to-text';
import TabularClassifier from './tabular-classifier';
import TextClassifier from './text-classifier';
import UnsupervisedObjectDetection from './unsupervised-object-detection';
import AutoCompletion from './auto-completion';
import SemanticSimilarity from './semantic-similarity';
import MultipleObjectTracking from './multiple-object-tracking';
import UnsupervisedImageClassifier from './unsupervised-image-classifier';
import UnsupervisedTextClassifier from './unsupervised-text-classifier';

const PerformanceOverview = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <ImageClassifier/>;

    case 'UNSUPERVISED_IMAGE_CLASSIFIER':

        return <UnsupervisedImageClassifier/>;

    case 'UNSUPERVISED_TEXT_CLASSIFIER':

        return <UnsupervisedTextClassifier/>;
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
    case 'SEMANTIC_SIMILARITY':

        return <SemanticSimilarity/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;
    case 'MULTIPLE_OBJECT_TRACKING':

        return <MultipleObjectTracking />;
    default:

        return null;
    }
};

export default PerformanceOverview;
