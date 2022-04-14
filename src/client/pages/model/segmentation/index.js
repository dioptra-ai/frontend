import useModel from 'hooks/use-model';
import TextClassifier from './text-classifier';
import ImageClassifier from './image-classifier';

const SegmentationDetails = (props) => {
    const model = useModel();

    switch (model.mlModelType) {

    case 'TEXT_CLASSIFIER':

        return <TextClassifier {...props}/>;

    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':

        return <ImageClassifier {...props}/>;
    default:

        return null;
    }
};

export default SegmentationDetails;
