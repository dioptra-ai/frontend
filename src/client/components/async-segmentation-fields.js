import PropTypes from 'prop-types';

import {setupComponent} from 'helpers/component-helper';
import Async from 'components/async';
import useAllFilters from 'hooks/use-all-filters';
import metricsClient from 'clients/metrics';

const AsyncSegmentationFields = ({renderData}) => {
    const allFilters = useAllFilters();

    return (
        <Async
            fetchData={() => metricsClient('queries/segmentation-columns', {
                filters: allFilters
            })}
            renderData={renderData}
        />
    );
};

AsyncSegmentationFields.propTypes = {
    renderData: PropTypes.func.isRequired
};

export default setupComponent(AsyncSegmentationFields);
