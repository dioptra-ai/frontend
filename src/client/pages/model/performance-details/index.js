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
import UnsupervisedImageClassifier from './unsupervised-image-classifier';
import UnsupervisedTextClassifier from './unsupervised-text-classifier';

const PerformanceDetails = (props) => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <ImageClassifier {...props}/>;

    case 'UNSUPERVISED_IMAGE_CLASSIFIER':

        return <UnsupervisedImageClassifier/>;

    case 'UNSUPERVISED_TEXT_CLASSIFIER':

        return <UnsupervisedTextClassifier/>;
    case 'TABULAR_CLASSIFIER':

        return <TabularClassifier {...props}/>;
    case 'DOCUMENT_PROCESSING':

        return <DocumentProcessing {...props}/>;
    case 'Q_N_A':

        return <QNA {...props}/>;
    case 'TEXT_CLASSIFIER':

        return <TextClassifier {...props}/>;
    case 'UNSUPERVISED_OBJECT_DETECTION':

        return <UnsupervisedObjectDetection {...props}/>;
    case 'SPEECH_TO_TEXT':

        return <SpeechToText {...props}/>;

    case 'AUTO_COMPLETION':

        return <AutoCompletion {...props}/>;
    case 'SEMANTIC_SIMILARITY':

        return <SemanticSimilarity/>;
    default:

        return null;
    }
};

export default PerformanceDetails;
