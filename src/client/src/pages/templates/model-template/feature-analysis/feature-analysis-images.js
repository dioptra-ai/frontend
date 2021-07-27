import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {formatDateTime} from 'helpers/date-helper';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import FilterInput from 'components/filter-input';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import MetricInfoBox from 'components/metric-info-box';
import AreaGraph from 'components/area-graph';
import BarGraph from 'components/bar-graph';

const FeatureAnalysisImages = ({filtersStore, timeStore}) => {

    return (
        <div>
            <FilterInput defaultFilters={filtersStore.filters} onChange={(filters) => filtersStore.filters = filters}/>
            <div className='my-5'>
                <h3 className='text-dark fw-bold fs-3 mb-3'>Unique Images</h3>
                <Row>
                    <Col className='d-flex' lg={2}>
                        <TimeseriesQuery
                            defaultData={[{unique: NaN}]}
                            renderData={([{unique}]) => (
                                <MetricInfoBox
                                    name='% Unique'
                                    unit='%'
                                    value={unique}
                                />
                            )}
                            sql={sql`
                                SELECT 100 * CAST(COUNT(distinct MV_TO_STRING("feature.image_embedding", '')) as double) / COUNT(*) as "unique"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                            `}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data.map(({uniques, __time}) => ({
                                        y: uniques,
                                        x: new Date(__time).getTime()
                                    }))}
                                    graphType='monotone'
                                    hasDot={false}
                                    isTimeDependent
                                    tickFormatter={(tick) => formatDateTime(tick).replace(' ', '\n')}
                                    title='Unique Images Over Time'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Unique Images (%)'
                                />
                            )}
                            sql={sql`
                                SELECT FLOOR(__time to MINUTE) as "__time",
                                100 * CAST(COUNT(distinct MV_TO_STRING("feature.image_embedding", '')) as double) / COUNT(*) as "uniques"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1
                            `}
                        />
                    </Col>
                    <Col className='d-flex' lg={5}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({name, value}) => ({
                                        name, value,
                                        fill: getHexColor(value)
                                    }))}
                                    title='Rotation Angle'
                                    yAxisName='Degrees'
                                />
                            )}
                            sql={sql`
                            SELECT "feature.rotation" as "name",
                              COUNT(*) AS "value"
                                FROM "dioptra-gt-combined-eventstream"
                                WHERE ${timeStore.sqlTimeFilter} AND ${filtersStore.sqlFilters}
                                GROUP BY 1
                                ORDER BY 1 ASC
                            `}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

FeatureAnalysisImages.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysisImages);
