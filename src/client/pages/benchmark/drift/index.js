import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'components/filter-input';
import Async from 'components/async';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';

const DriftAnalysis = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();

    // This is ugly. Should find a better way to do it
    const d = new Date();

    d.setDate(d.getDate() - 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    const allReferenceFilters = `${allSqlFilters
        .replace(/\("dataset_id"=[^)]+\)/, '')
        .replace(/\("model_version"=[^)]+\)/, '')
        .replace(/\("benchmark_id"=[^)]+\)/, '')
        .replaceAll(/AND(\s+AND)+/g, 'AND')
    } AND __time >= '${d.toISOString()}' AND "dataset_id" IS NULL AND "benchmark_id" IS NULL`;

    return (
        <div>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-3'>
                <Row>
                    <Col>
                        <Async
                            refetchOnChanged={[allReferenceFilters, allSqlFilters]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: allReferenceFilters
                            })}
                            renderData={(data) => (
                                <ScatterGraph
                                    data={data?.outlier_analysis?.map(({image_url, dimensions, outlier, novelty, request_id}) => ({
                                        sample: image_url,
                                        PCA1: dimensions[0],
                                        PCA2: dimensions[1],
                                        outlier,
                                        novelty,
                                        request_id
                                    }))}
                                    noveltyIsObsolete
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

DriftAnalysis.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(DriftAnalysis);
