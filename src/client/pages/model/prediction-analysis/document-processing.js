import {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Select from 'components/select';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import HeatMap from 'components/heatmap';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import useModal from 'hooks/useModal';
import Modal from 'components/modal';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';
import ClassDistribution from 'pages/common/class-distribution';

const PredictionAnalysis = () => {
    const allSqlFiltersWithoutOrgId = useAllSqlFilters({__REMOVE_ME__excludeOrgId: true});
    const [classFilter, setClassFilter] = useState(null);
    const [heatMapSamples, setHeatMapSamples] = useState([]);
    const [exampleInModal, setExampleInModal] = useModal(null);

    return (
        <>
            <div className='my-3'>
                <ClassDistribution/>
            </div>
            <div className='my-3'>
                <Row className='rounded border m-0'>
                    <Col className='d-flex align-items-center' lg={4}>
                        <h4 className='text-dark bold-text fs-4 m-0'>Bounding Box Location Analysis</h4>
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
                    <Col lg={8} className='rounded p-3 pt-0 position-relative'>
                        <div className='position-absolute' style={{right: '1rem'/* p-3 = 1rem*/}}>
                            <AddFilters disabled={!heatMapSamples?.length} filters={[new Filter({
                                left: 'request_id',
                                op: 'in',
                                right: heatMapSamples.map((s) => s.bounding_box.request_id)
                            })]}/>
                        </div>
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
    );
};

export default PredictionAnalysis;
