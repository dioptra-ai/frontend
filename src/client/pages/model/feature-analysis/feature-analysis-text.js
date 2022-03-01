import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import useModel from 'hooks/use-model';
import {setupComponent} from 'helpers/component-helper';
import AreaGraph from 'components/area-graph';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';
import useTimeGranularity from 'hooks/use-time-granularity';
import {FaQuestionCircle} from 'react-icons/fa';
import {Tooltip as BootstrapTooltip, OverlayTrigger} from 'react-bootstrap';

const embeddingDistanceTooltip = <OverlayTrigger
    placement="bottom"
    overlay={
        <BootstrapTooltip>
          Based on cosine similarity
        </BootstrapTooltip>
    }
>
    <FaQuestionCircle
        className="cursor-pointer blinking"
        style={{
            height: 30
        }}
    />
</OverlayTrigger>;

const FeatureAnalysisText = ({timeStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceFilters: true});
    const timeGranularity = useTimeGranularity()?.toISOString();
    const {mlModelType} = useModel();

    return (
        <>
            <div className='my-3'>
                <Row>
                    <div>
                        <Async
                            refetchOnChanged={[allOfflineSqlFilters, allSqlFilters, timeGranularity]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'bi_non_cat_distance',
                                reference_filters: allOfflineSqlFilters,
                                current_filters: allSqlFilters,
                                time_granularity: timeGranularity
                            })}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data?.distance?.map(({time, distance}) => ({
                                        y: distance * 100,
                                        x: new Date(time).getTime()
                                    }))}
                                    title={
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            height: 29,
                                            gap: 8,
                                        }}>
                                            <span>Embedding Distance</span>
                                            {embeddingDistanceTooltip}
                                        </div>
                                        
                                    }
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Distance (%)'
                                />
                            )
                            }
                        />
                    </div>
                </Row>
            </div>
            <div className='my-3'>
                <Row>
                    <Col>
                        <Async
                            refetchOnChanged={[allOfflineSqlFilters, allSqlFilters]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: allOfflineSqlFilters,
                                model_type: mlModelType
                            })}
                            renderData={(data) => (
                                <ScatterGraph
                                    data={data?.outlier_analysis?.map(({sample, dimensions, outlier, novelty, request_id}) => ({
                                        sample,
                                        PCA1: dimensions[0],
                                        PCA2: dimensions[1],
                                        outlier,
                                        novelty,
                                        request_id
                                    }))}
                                    examplesType='text'
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

FeatureAnalysisText.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysisText);
