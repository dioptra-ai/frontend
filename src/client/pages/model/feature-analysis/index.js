import {useContext} from 'react';
import useModel from 'hooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';
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

            return <PerformanceClustersAnalysis/>;
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
