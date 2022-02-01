import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'pages/common/filter-input';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';

/////////////////////////////////////////////////////////////////////////
///
/// If this ever starts to branch out by model types, implement the same
/// switch pattern as in the other folders.
///
/////////////////////////////////////////////////////////////////////////

const DriftAnalysis = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const allReferenceFilters = useAllSqlFilters({forLiveModel: true});

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
                                reference_filters: allReferenceFilters,
                                model_type: mlModelType

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
