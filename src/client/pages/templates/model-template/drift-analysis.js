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

    // This is uggly. Should find a better way to do it

    const dateNow = new Date().toISOString();

    const d = new Date();

    d.setDate(d.getDate() - 1);
    const dateLast24h = d.toISOString();
    const allSqlFilters = useAllSqlFilters();

    const allReferenceFilters = `${useAllSqlFilters()
        .replace(/\("dataset_id"=[^)]+\)/, '')
        .replace(/\("model_version"=[^)]+\)/, '')
        .replace(/\("benchmark_id"=[^)]+\)/, '')
        .replace(/AND[ ]+AND/g, 'AND')
        .replace(/AND[ ]+AND/g, 'AND')
    } AND __time >= '${dateLast24h}' AND __time < '${dateNow}'`;

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
                                    obsolete={true}
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
