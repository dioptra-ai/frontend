import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'pages/common/filter-input';
import PerformanceClustersAnalysis from 'pages/common/performance-clusters-analysis';

const QnA = ({filtersStore}) => {

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

QnA.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(QnA);
