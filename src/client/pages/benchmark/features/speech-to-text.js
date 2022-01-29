import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'components/filter-input';
import PerformanceClustersAnalysis from 'pages/templates/model-template/performance-clusters-analysis';

const SpeechToText = ({filtersStore}) => {

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <PerformanceClustersAnalysis/>
        </>
    );
};

SpeechToText.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(SpeechToText);
