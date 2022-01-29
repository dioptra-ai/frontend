import FilterInput from 'components/filter-input';
import {setupComponent} from 'helpers/component-helper';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Segmentation from 'pages/common/segmentation';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import MetricInfoBox from 'components/metric-info-box';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import CountEvents from 'components/count-events';
import useTimeGranularity from 'customHooks/use-time-granularity';

const SpeechToText = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const {mlModelType} = useModel();
    const sampleSizeComponent = <CountEvents sqlFilters={allSqlFilters}/>;
    const timeGranularity = useTimeGranularity()?.toISOString();

    // This is ugly. Should find a better way to do it
    const d = new Date();

    d.setDate(d.getDate() - 1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return (
        <div className='pb-3'>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <Row className='my-3 align-items-stretch'>
                <Col className='d-flex' lg={3}>
                    <MetricInfoBox
                        name='Datapoints'
                    >
                        {sampleSizeComponent}
                    </MetricInfoBox>
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('exact-match', {
                            sql_filters: allSqlFilters,
                            time_granularity: timeGranularity,
                            model_type: mlModelType
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='EM'
                                value={d?.value}
                            />
                        )}
                    />
                </Col>
                <Col className='d-flex' lg={3}>
                    <Async
                        fetchData={() => metricsClient('word-error-rate', {
                            sql_filters: allSqlFilters,
                            time_granularity: timeGranularity,
                            model_type: mlModelType
                        })}
                        refetchOnChanged={[allSqlFilters]}
                        renderData={([d]) => (
                            <MetricInfoBox
                                name='WER'
                                value={d?.value}
                            />
                        )}
                    />
                </Col>
            </Row>
            <Segmentation />
        </div>
    );
};

SpeechToText.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    benchmarkFilters: PropTypes.string
};

export default setupComponent(SpeechToText);
