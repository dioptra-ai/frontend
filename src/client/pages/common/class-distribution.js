import PropTypes from 'prop-types';
import Async from 'components/async';
import BarGraph from 'components/bar-graph';
import metricsClient from 'clients/metrics';
import {getHexColor} from 'helpers/color-helper';
import useAllFilters from 'hooks/use-all-filters';

const ClassTruthDistribution = ({classField, classFieldDisplayName}) => {
    const allFilters = useAllFilters();

    return (
        <Async
            refetchOnChanged={[allFilters]}
            renderData={(data) => (
                <BarGraph
                    bars={data.map((result) => ({
                        name: result.label,
                        value: result.value,
                        fill: getHexColor(result.label)
                    }))}
                    title={`${classFieldDisplayName} Distribution`}
                />
            )}
            fetchData={() => metricsClient('queries/class-distribution', {
                filters: allFilters,
                distribution_field: classField
            })}
        />
    );
};

ClassTruthDistribution.propTypes = {
    classField: PropTypes.string.isRequired,
    classFieldDisplayName: PropTypes.string.isRequired
};

export default ClassTruthDistribution;
