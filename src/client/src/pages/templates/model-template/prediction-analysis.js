import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FilterInput from 'components/filter-input';
import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import Select from 'components/select';
import TimeseriesQuery, {sql} from 'components/timeseries-query';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import {useState} from 'react';

const PredictionAnalysis = ({timeStore, filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const timeGranularity = timeStore.getTimeGranularity().toISOString();
    const [classFilter, setClassFilter] = useState('all_classes');

    console.log(classFilter);
    const {mlModelType} = useModel();

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-5'>
                <h3 className='text-dark bold-text fs-3 mb-3'>
                    {mlModelType !== 'DOCUMENT_PROCESSING' ?
                        'Prediction Analysis' :
                        'Class Offline / Online Skew'}
                </h3>
                <Row className='my-5'>
                    <Col className='d-flex' lg={4}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({prediction, my_percentage}) => ({
                                        name: getName(prediction),
                                        value: my_percentage,
                                        fill: getHexColor(prediction)
                                    }))}
                                    title='Online Class Distribution'
                                    unit='%'
                                />
                            )}
                            sql={sql`
                                  SELECT
                                    TRUNCATE(100 * cast(my_table.my_count as float) / cast(my_count_table.total_count as float), 2) as my_percentage,
                                    my_table.prediction
                                  FROM (
                                    SELECT
                                        count(1) as my_count,
                                        prediction,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        ${allSqlFilters}
                                    GROUP BY 2
                                  ) AS my_table
                                  JOIN (
                                    SELECT
                                        count(*) as total_count,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE
                                        ${allSqlFilters}
                                  ) AS my_count_table
                                  ON my_table.join_key = my_count_table.join_key`}
                        />
                    </Col>
                    <Col className='d-flex' lg={4}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <BarGraph
                                    bars={data.map(({prediction, my_percentage}) => ({
                                        name: getName(prediction),
                                        value: my_percentage,
                                        fill: getHexColor(prediction)
                                    }))}
                                    title='Offline Class Distribution'
                                    unit='%'
                                />
                            )}
                            sql={sql`
                                  SELECT
                                    TRUNCATE(100 * cast(my_table.my_count as float) / cast(my_count_table.total_count as float), 2) as my_percentage,
                                    my_table.prediction
                                  FROM (
                                    SELECT
                                        count(1) as my_count,
                                        prediction,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE ${allOfflineSqlFilters}
                                    GROUP BY 2
                                  ) AS my_table
                                  JOIN (
                                    SELECT
                                        count(*) as total_count,
                                        1 as join_key
                                    FROM "dioptra-gt-combined-eventstream"
                                    WHERE ${allOfflineSqlFilters}
                                  ) AS my_count_table
                                  ON my_table.join_key = my_count_table.join_key`}
                        />
                    </Col>
                    <Col className='d-flex' lg={4}>
                        <TimeseriesQuery
                            defaultData={[]}
                            renderData={(data) => (
                                <AreaGraph
                                    dots={data}
                                    title={`${
                                        mlModelType !== 'DOCUMENT_PROCESSING' ?
                                            'Offline / Online Distribution ' :
                                            ''
                                    }Distance`}
                                    unit='%'
                                    xAxisDomain={timeStore.rangeMillisec}
                                    xAxisName='Time'
                                    yAxisName='Distance'
                                />
                            )}
                            sql={sql`WITH my_online_table as (
                                      SELECT
                                        my_table.my_time,
                                        cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                        my_table.prediction
                                      FROM (
                                        SELECT
                                            TIME_FLOOR(__time, '${timeGranularity}') as my_time,
                                            count(1) as my_count,
                                            prediction
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                        GROUP BY 1, 3
                                      ) AS my_table
                                      JOIN (
                                        SELECT
                                            TIME_FLOOR(__time, '${timeGranularity}') as my_time,
                                            count(*) as total_count
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allSqlFilters}
                                        GROUP BY 1
                                      ) AS my_count_table
                                      ON my_table.my_time = my_count_table.my_time
                                    ),

                                    my_offline_table as (
                                      SELECT
                                        cast(my_table.my_count as float) / cast(my_count_table.total_count as float) as my_percentage,
                                        my_table.prediction
                                      FROM (
                                        SELECT
                                            count(1) as my_count,
                                            prediction,
                                            1 as join_key
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allOfflineSqlFilters}
                                        GROUP BY 2
                                      ) AS my_table
                                      JOIN (
                                        SELECT
                                            count(*) as total_count,
                                            1 as join_key
                                        FROM "dioptra-gt-combined-eventstream"
                                        WHERE ${allOfflineSqlFilters}
                                      ) AS my_count_table
                                      ON my_table.join_key = my_count_table.join_key
                                    )

                                    SELECT
                                        my_online_table.my_time as x,
                                        100 * sqrt(sum(POWER(my_online_table.my_percentage - my_offline_table.my_percentage, 2))) as y
                                    FROM my_online_table
                                    JOIN my_offline_table
                                    ON my_offline_table.prediction = my_online_table.prediction
                                    GROUP BY 1
                            `}
                        />
                    </Col>
                </Row>
            </div>

            {mlModelType === 'DOCUMENT_PROCESSING' ? (
                <>
                    <div className='my-5'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>
              Bounding Box Size Analysis
                        </h3>
                        <Row className='my-5 rounded border mx-1'>
                            <Col lg={{span: 3, offset: 9}} className='my-3'>
                                <Select
                                    options={[
                                        {name: 'All Classes', value: 'all_classes'},
                                        {name: 'SSN', value: 'ssn'},
                                        {name: 'First Name', value: 'first_name'},
                                        {name: 'Last Name', value: 'last_name'},
                                        {name: 'Zip Code', value: 'zip_code'}
                                    ]}
                                    initialValue={classFilter}
                                    onChange={setClassFilter}
                                />
                            </Col>
                            <Col className='d-flex' lg={4}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={(data) => (
                                        <BarGraph
                                            bars={data.map(({prediction, my_percentage}) => ({
                                                name: getName(prediction),
                                                value: my_percentage,
                                                fill: getHexColor(prediction)
                                            }))}
                                            title='Bounding Box Size Distribution'
                                            unit='%'
                                            className='border-0'
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                            <Col className='d-flex' lg={8}>
                                <TimeseriesQuery
                                    defaultData={[]}
                                    renderData={(data) => (
                                        <AreaGraph
                                            dots={data}
                                            title='Average'
                                            unit='%'
                                            xAxisDomain={timeStore.rangeMillisec}
                                            xAxisName='Time'
                                            yAxisName='Relative Coordinates (%)'
                                            className='border-0 rounded-0'
                                            hasBorder={false}
                                        />
                                    )}
                                    sql={sql`SELECT 1 as "one"`}
                                />
                            </Col>
                        </Row>
                    </div>
                </>
            ) : null}
        </>
    );
};

PredictionAnalysis.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    timeStore: PropTypes.object.isRequired
};
export default setupComponent(PredictionAnalysis);
