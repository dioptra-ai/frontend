import {useContext} from 'react';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import QAPerfAnalysis from 'pages/templates/model-template/qa-perf-analysis';
import appContext from 'context/app-context';

const FeatureAnalysis = () => {
    const model = useModel();
    const {isTimeEnabled} = useContext(appContext);

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':
    case 'DOCUMENT_PROCESSING':
    case 'UNSUPERVISED_OBJECT_DETECTION':
    case 'SPEECH_TO_TEXT':
        if (isTimeEnabled) {

            return <FeatureAnalysisImages/>;
        } else {

            return <QAPerfAnalysis/>;
        }

    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    case 'TEXT_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    default:
        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

export default FeatureAnalysis;
