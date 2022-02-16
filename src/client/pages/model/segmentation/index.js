import useModel from 'hooks/use-model';
import TextClassifier from './text-classifier';

const SegmentationDetails = (props) => {
    const model = useModel();

    switch (model.mlModelType) {

    case 'TEXT_CLASSIFIER':

        return <TextClassifier {...props}/>;
    default:

        return null;
    }
};

export default SegmentationDetails;
