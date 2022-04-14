import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModel from 'hooks/use-model';
import Async from 'components/async';
import AreaGraph from 'components/area-graph';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import metricsClient from 'clients/metrics';
import useTimeGranularity from 'hooks/use-time-granularity';
import {setupComponent} from 'helpers/component-helper';

const ClassDistribution = ({timeStore}) => {
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceFilters: true});
    const timeGranularity = useTimeGranularity()?.toISOString();

    return (

        <Row className='my-3'>
            <Col className='d-flex' lg={4}>
                <Async
                    refetchOnChanged={[allSqlFilters, mlModelType]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({name, value}) => ({
                                name,
                                value,
                                fill: getHexColor(name)
                            }))}
                            title='Online Class Distribution'
                            unit='%'
                        />
                    )}
                    fetchData={() => metricsClient(`queries/${(mlModelType === 'IMAGE_CLASSIFIER' || mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' ||
                            mlModelType === 'TEXT_CLASSIFIER') ?
                        'class-distribution-1' :
                        'class-distribution-2'}`, {sql_filters: allSqlFilters})}
                />
            </Col>
            <Col className='d-flex' lg={4}>
                <Async
                    refetchOnChanged={[allSqlFilters, mlModelType]}
                    renderData={(data) => (
                        <BarGraph
                            bars={data.map(({name, value}) => ({
                                name,
                                value,
                                fill: getHexColor(name)
                            }))}
                            title='Offline Class Distribution'
                            unit='%'
                        />
                    )}
                    fetchData={() => metricsClient(`queries/${(mlModelType === 'IMAGE_CLASSIFIER' || mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' ||
                            mlModelType === 'TEXT_CLASSIFIER') ?
                        'class-distribution-1' :
                        'class-distribution-2'}`, {sql_filters: allOfflineSqlFilters})}
                />
            </Col>
            <Col className='d-flex' lg={4}>
                <Async
                    refetchOnChanged={[
                        allOfflineSqlFilters, mlModelType,
                        timeGranularity, allSqlFilters
                    ]}
                    renderData={(data) => (
                        <AreaGraph
                            dots={data}
                            title='Offline / Online Distribution Distance'
                            unit='%'
                            xAxisDomain={timeStore.rangeMillisec}
                            xAxisName='Time'
                            yAxisName='Distance'
                        />
                    )}
                    fetchData={() => metricsClient(`queries/${
                        mlModelType === 'DOCUMENT_PROCESSING' || mlModelType === 'UNSUPERVISED_OBJECT_DETECTION' ?
                            'offline-online-distribution-distance-2' :
                            'offline-online-distribution-distance-1'}`, {
                        offline_sql_filters: allOfflineSqlFilters,
                        time_granularity: timeGranularity,
                        sql_filters: allSqlFilters
                    })}
                />
            </Col>
        </Row>
    );
};

ClassDistribution.propTypes = {
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(ClassDistribution);
