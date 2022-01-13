import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import FilterInput from 'components/filter-input';
import BarGraph from 'components/bar-graph';
import AreaGraph from 'components/area-graph';
import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import {getName} from 'helpers/name-helper';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import useModel from 'customHooks/use-model';
import HeatMap from 'components/heatmap';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import useModal from 'customHooks/useModal';
import Modal from 'components/modal';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';

const PredictionAnalysis = ({timeStore, filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const allSqlFiltersWithoutOrgId = useAllSqlFilters({__REMOVE_ME__excludeOrgId: true});
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const timeGranularity = timeStore.getTimeGranularity().toISOString();
    const [classFilter, setClassFilter] = useState(null);
    const [heatMapSamples, setHeatMapSamples] = useState([]);
    const [exampleInModal, setExampleInModal] = useModal(null);

    const {mlModelType} = useModel();

    return (
        <>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
            <div className='my-3'>
                <h3 className='text-dark bold-text fs-3 mb-3'>
                    {mlModelType === 'DOCUMENT_PROCESSING' ?
                        'Class Offline / Online Skew' :
                        'Prediction Analysis'}
                </h3>
                <Row className='my-3'>
                    <Col className='d-flex' lg={4}>
                        <Async
                            refetchOnChanged={[allSqlFilters, mlModelType]}
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
                            fetchData={() => metricsClient(`queries/${(mlModelType === 'IMAGE_CLASSIFIER' ||
                            mlModelType === 'TEXT_CLASSIFIER') ?
                                'online-class-distribution-1' :
                                'online-class-distribution-2'}`, {sql_filters: allSqlFilters})}
                        />
                    </Col>
                    <Col className='d-flex' lg={4}>
                        <Async
                            refetchOnChanged={[allOfflineSqlFilters, mlModelType]}
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
                            fetchData={() => metricsClient(`queries/${mlModelType === 'DOCUMENT_PROCESSING' ?
                                'offline-class-distribution-1' :
                                'offline-class-distribution-2'}`, {offline_sql_filters: allOfflineSqlFilters})}
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
                            fetchData={() => metricsClient(`queries/${mlModelType === 'DOCUMENT_PROCESSING' ?
                                'offline-online-distribution-distance-1' :
                                'offline-online-distribution-distance-2'}`, {
                                offline_sql_filters: allOfflineSqlFilters,
                                time_granularity: timeGranularity,
                                sql_filters: allSqlFilters
                            })}
                        />
                    </Col>
                </Row>
            </div>

            {mlModelType === 'DOCUMENT_PROCESSING' ? (
                <>
                    <div className='my-3'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>
                            Bounding Box Size Analysis
                        </h3>
                        <Row className='my-3'>
                            <Col className='d-flex' lg={4}>
                                <Async
                                    refetchOnChanged={[allSqlFilters, timeGranularity]}
                                    renderData={(data) => (
                                        <BarGraph
                                            bars={data.map(({name, value}) => ({
                                                name,
                                                value,
                                                fill: getHexColor(value)
                                            }))}
                                            title='Bounding Box Size Distribution'
                                            unit='%'
                                            yAxisName='Percent'
                                        />
                                    )}
                                    fetchData={
                                        () => metricsClient('queries/image-distribution',
                                            {sql_filters: allSqlFilters, time_granularity: timeGranularity})
                                    }
                                />
                            </Col>
                            <Col className='d-flex' lg={8}>
                                <Async
                                    refetchOnChanged={[timeGranularity, allSqlFilters]}
                                    renderData={(data) => (
                                        <AreaGraph
                                            dots={data}
                                            title='Average'
                                            xAxisDomain={timeStore.rangeMillisec}
                                            xAxisName='Time'
                                            yAxisName='Relative Coordinates (%)'
                                            xDataKey='time'
                                            yDataKey='value'
                                        />
                                    )}
                                    fetchData={
                                        () => metricsClient('queries/image-distribution-average',
                                            {sql_filters: allSqlFilters, time_granularity: timeGranularity})
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className='my-3'>
                        <h3 className='text-dark bold-text fs-3 mb-3'>
                            Bounding Box Location Analysis
                        </h3>
                        <Row className='my-3 rounded border mx-1'>
                            <Col className='d-flex align-items-center' lg={4}>
                                <h4 className='text-dark bold-text fs-4 m-0'>Heat Map</h4>
                            </Col>
                            <Col className='d-flex align-items-center' lg={4}>
                                <h4 className='text-dark bold-text fs-4 m-0'>
                                    Bounding Box Examples
                                </h4>
                            </Col>
                            <Col lg={{span: 3, offset: 1}} className='my-3'>
                                <Async
                                    refetchOnChanged={[allSqlFiltersWithoutOrgId]}
                                    fetchData={() => metricsClient('get-distinct', {
                                        field: 'prediction.class_name',
                                        sql_filters: allSqlFiltersWithoutOrgId
                                    })}
                                    renderData={(data) => (
                                        <Select
                                            options={[{name: '<all values>', value: ''}, ...data.map((d) => {
                                                const c = d['prediction.class_name'];

                                                return {name: c, value: c};
                                            })]}
                                            initialValue={classFilter}
                                            onChange={setClassFilter}
                                        />
                                    )}
                                />
                            </Col>
                            <Col lg={4}>
                                <Async
                                    refetchOnChanged={[allSqlFiltersWithoutOrgId, classFilter]}
                                    fetchData={() => metricsClient('bbox-locations', {
                                        sql_filters: `${allSqlFiltersWithoutOrgId} AND 
                                            ${classFilter ? `"prediction.class_name"='${classFilter}'` : 'TRUE'}`
                                    })}
                                    renderData={({num_cells_h, num_cells_w, cells}) => (
                                        <HeatMap
                                            numCellsH={num_cells_h}
                                            numCellsW={num_cells_w}
                                            data={cells}
                                            setHeatMapSamples={setHeatMapSamples}
                                            selectedSamples={heatMapSamples}
                                        />
                                    )}
                                />
                            </Col>
                            <Col lg={8} className='rounded p-3 pt-0'>
                                <AddFilters disabled={!heatMapSamples?.length} filters={[new Filter({
                                    key: 'request_id',
                                    op: 'in',
                                    value: heatMapSamples.map((s) => s.bounding_box.request_id)
                                })]}/>
                                {heatMapSamples.length ? (
                                    <div
                                        className={
                                            'd-flex p-2 overflow-auto flex-grow-1 justify-content-left flex-wrap w-100 h-100 bg-white-blue'
                                        }
                                        style={{maxHeight: 600}}
                                    >
                                        {heatMapSamples.map((sample, i) => {
                                            const {image_url, width, height, bounding_box} = sample;

                                            return (
                                                <div
                                                    key={i} className='m-4 heat-map-item cursor-pointer'
                                                    onClick={() => setExampleInModal(sample)}
                                                >
                                                    <img
                                                        alt='Example'
                                                        className='rounded'
                                                        src={image_url}
                                                        height={200}
                                                    />
                                                    <div className='heat-map-box' style={{
                                                        height: bounding_box.h * 200,
                                                        width: bounding_box.w * (200 * width / height),
                                                        top: (bounding_box.y - bounding_box.h / 2) * 200,
                                                        left: (bounding_box.x - bounding_box.w / 2) * (200 * width / height)
                                                    }}/>
                                                </div>
                                            );
                                        })}&nbsp;
                                    </div>
                                ) : (
                                    <div
                                        className={
                                            'd-flex p-2 overflow-auto flex-grow-1 justify-content-center align-items-center w-100 h-100 bg-white-blue'
                                        }
                                    >
                                        <h3 className='text-secondary m-0'>No Data Available</h3>
                                    </div>
                                )}
                            </Col>
                        </Row>
                        {exampleInModal ? <Modal onClose={() => setExampleInModal(null)} title='Example'>
                            <div style={{position: 'relative'}}>
                                <img
                                    alt='Example'
                                    className='rounded modal-image'
                                    src={exampleInModal.image_url}
                                    style={{
                                        height: 600
                                    }}
                                />
                                <div className='heat-map-box' style={{
                                    height: exampleInModal.bounding_box.h * 600,
                                    width: exampleInModal.bounding_box.w * exampleInModal.width * 600 / exampleInModal.height,
                                    top: (exampleInModal.bounding_box.y - exampleInModal.bounding_box.h / 2) * 600,
                                    left: (exampleInModal.bounding_box.x - exampleInModal.bounding_box.w / 2) * exampleInModal.width * 600 / exampleInModal.height
                                }}/>
                            </div>
                        </Modal> : null}
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
