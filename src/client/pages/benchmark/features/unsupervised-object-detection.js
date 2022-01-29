import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'components/filter-input';
import PerformanceClustersAnalysis from 'pages/templates/model-template/performance-clusters-analysis';

const UnsupervisedObjectDetection = ({filtersStore}) => {

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

UnsupervisedObjectDetection.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(UnsupervisedObjectDetection);
