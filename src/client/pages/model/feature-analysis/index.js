import PropTypes from 'prop-types';
import {useContext} from 'react';
import useModel from 'customHooks/use-model';
import FeatureIntegrityTable from './feature-integrity';
import FeatureAnalysisImages from './feature-analysis-images';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';
import appContext from 'context/app-context';
import FilterInput from 'components/filter-input';
import {setupComponent} from 'helpers/component-helper';

const FeatureAnalysis = ({filtersStore}) => {
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

            return (
                <>
                    <FilterInput
                        defaultFilters={filtersStore.filters}
                        onChange={(filters) => (filtersStore.filters = filters)}
                    />
                    <PerformanceClustersAnalysis/>
                </>
            );
        }

    case 'TABULAR_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    case 'TEXT_CLASSIFIER':

        return <FeatureIntegrityTable/>;
    default:
        throw new Error(`Unknown model type: ${model.mlModelType}`);
    }
};

FeatureAnalysis.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysis);
