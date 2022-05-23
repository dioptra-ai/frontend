import metricsClient from 'clients/metrics';
import AddFilters from 'components/add-filters';
import Async from 'components/async';
import HeatMap from 'components/heatmap';
import Modal from 'components/modal';
import Select from 'components/select';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import useModal from 'hooks/useModal';
import {useState} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import {Filter} from 'state/stores/filters-store';
import {BsMinecartLoaded} from 'react-icons/bs';
import FrameWithBoundingBox from 'components/preview-image-classification';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import MinerModal from 'components/miner-modal';

const BBoxLocationAnalysis = () => {
    const allSqlFiltersWithoutOrgId = useAllSqlFilters({
        __REMOVE_ME__excludeOrgId: true
    });
    const [classFilter, setClassFilter] = useState(null);
    const [heatMapSamples, setHeatMapSamples] = useState([]);
    const [exampleInModal, setExampleInModal] = useModal(null);
    const [minerModalOpen, setMinerModalOpen] = useModal(false);

    return (
        <>
            <Row className='rounded border m-0'>
                <Col className='d-flex align-items-center' lg={4}>
                    <h4 className='text-dark bold-text fs-4 m-0'>
                        Bounding Box Location Analysis
                    </h4>
                </Col>
                <Col className='d-flex align-items-center' lg={4}>
                </Col>
                <Col lg={{span: 3, offset: 1}} className='my-3'>
                    <Async
                        refetchOnChanged={[allSqlFiltersWithoutOrgId]}
                        fetchData={() => metricsClient('get-distinct', {
                            field: 'prediction.class_name',
                            sql_filters: allSqlFiltersWithoutOrgId
                        })
                        }
                        renderData={(data) => (
                            <Select
                                options={[
                                    {name: '<all values>', value: ''},
                                    ...data.map((d) => {
                                        const c = d['prediction.class_name'];

                                        return {name: c, value: c};
                                    })
                                ]}
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
                                            ${
        classFilter ?
            `"prediction.class_name"='${classFilter}'` :
            'TRUE'
        }`
                        })
                        }
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
                    <div
                        className='position-absolute'
                        style={{right: '1rem' /* p-3 = 1rem*/}}
                    >
                        <AddFilters
                            disabled={!heatMapSamples?.length}
                            filters={[
                                new Filter({
                                    left: 'request_id',
                                    op: 'in',
                                    right: heatMapSamples.map(
                                        (s) => s['bounding_box']['request_id']
                                    )
                                })
                            ]}
                        />
                        <OverlayTrigger overlay={<Tooltip>Mine for Similar Datapoints</Tooltip>}>
                            <button
                                className='text-dark border-0 bg-transparent click-down fs-2' onClick={() => {
                                    setMinerModalOpen(true);
                                }}>
                                <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/>
                            </button>
                        </OverlayTrigger>
                        <MinerModal isOpen={minerModalOpen} onClose={() => setMinerModalOpen(false)} requestIds={heatMapSamples.map((s) => s['bounding_box']['request_id'])}/>
                    </div>
                    {heatMapSamples.length ? (
                        <div
                            className={
                                'd-flex p-2 overflow-auto flex-grow-1 justify-content-left flex-wrap w-100 h-100 bg-white-blue'
                            }
                            style={{maxHeight: 600}}
                        >
                            {heatMapSamples.map((sample) => {
                                const {image_url, width, height, bounding_box} =
                                    sample;
                                const {video_frame, video_frame_rate} = bounding_box;

                                return (
                                    <div
                                        key={JSON.stringify(sample)}
                                        className='m-4 heat-map-item'
                                    >
                                        <FrameWithBoundingBox
                                            videoUrl={video_frame ? image_url : null}
                                            videoControls={false}
                                            imageUrl={video_frame ? null : image_url}
                                            frameW={width} frameH={height}
                                            boxW={bounding_box.w * width}
                                            boxH={bounding_box.h * height}
                                            boxL={width * (bounding_box.x - bounding_box.w / 2)}
                                            boxT={height * (bounding_box.y - bounding_box.h / 2)}
                                            videoSeekToSec={video_frame / video_frame_rate}
                                            maxHeight={200}
                                            onClick={() => setExampleInModal(sample)}
                                        />
                                    </div>
                                );
                            })}
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
            {exampleInModal ? (
                <Modal onClose={() => setExampleInModal(null)} title='Example'>
                    <FrameWithBoundingBox
                        videoUrl={exampleInModal.video_frame ? exampleInModal.image_url : null}
                        videoControls
                        imageUrl={exampleInModal.video_frame ? null : exampleInModal.image_url}
                        frameW={exampleInModal.width}
                        frameH={exampleInModal.height}
                        boxW={exampleInModal.bounding_box.w * exampleInModal.width}
                        boxH={exampleInModal.bounding_box.h * exampleInModal.height}
                        boxL={exampleInModal.width * (exampleInModal.bounding_box.x - exampleInModal.bounding_box.w / 2) }
                        boxT={exampleInModal.height * (exampleInModal.bounding_box.y - exampleInModal.bounding_box.h / 2) }
                        videoSeekToSec={exampleInModal.bounding_box.video_frame / exampleInModal.bounding_box.video_frame_rate}
                        maxHeight={600}
                    />
                </Modal>
            ) : null}
        </>
    );
};

export default BBoxLocationAnalysis;
