import useModel from 'customHooks/use-model';

const Predictions = () => {
    const model = useModel();

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'TABULAR_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':
    case 'Q_N_A':
    case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_OBJECT_DETECTION':
    case 'SPEECH_TO_TEXT':
    }
};

export default Predictions;
