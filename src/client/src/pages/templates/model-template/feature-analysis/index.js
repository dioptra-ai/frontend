import PropTypes from 'prop-types';
import {useParams} from 'react-router-dom';

import {setupComponent} from 'helpers/component-helper';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';

const FeatureAnalysis = ({modelStore}) => {
    const currentModelId = useParams()._id;
    const model = modelStore.getModelById(currentModelId);

    switch (model.mlModelType) {
    case 'IMAGE_CLASSIFIER':

        return <FeatureAnalysisImages model={model}/>;
    default:

        return <FeatureIntegrityTable model={model}/>;
    }
};

FeatureAnalysis.propTypes = {
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysis);
