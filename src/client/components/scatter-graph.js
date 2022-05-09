import PropTypes from 'prop-types';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
    CartesianGrid,
    Legend,
    ReferenceArea,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    ZAxis
} from 'recharts';
import {useThrottle} from '@react-hook/throttle';
import {saveAs} from 'file-saver';
import {IoDownloadOutline} from 'react-icons/io5';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {BsMinecartLoaded} from 'react-icons/bs';
import theme from 'styles/theme.module.scss';
import useModal from 'hooks/useModal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'components/modal';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';
import MinerModal from 'components/miner-modal';
import FrameWithBoundingBox from 'components/frame-with-bounding-box';

const LARGE_DOT_SIZE = 200;
const MEDIUM_DOT_SIZE = 100;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const ScatterGraph = ({data, noveltyIsObsolete, outliersAreMislabeled}) => {
    const ref = useRef();
    const firstOutlier = useMemo(() => {
        return data.find(({outlier}) => outlier);
    }, [data]);
    const firstNonOutlier = useMemo(() => {
        return data.find(({outlier}) => !outlier);
    }, [data]);
    const [selectedPoints, setSelectedPoints] = useState([
        firstOutlier || firstNonOutlier
    ]);
    const [exampleInModal, setExampleInModal] = useModal(false);
    const [shiftPressed, setShiftPressed] = useState(false);
    const [refTopLeft, setRefTopLeft] = useThrottle(null, 10, true);
    const [refBottomRight, setRefBottomRight] = useThrottle(null, 10, true);
    const [multiSelect, setMultiSelect] = useState(false);
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const samples = selectedPoints?.map(({sample}) => sample);
    const sampleRequestIds = selectedPoints?.map(({request_id}) => request_id);
    const examplesType = samples.every((s) => (/\.mp4$/).test(s)) ? 'video' : samples.every((s) => (/^https?:\/\//).test(s['image_metadata.uri'])) ? 'image' : 'text';

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

    useEffect(() => {
        setSelectedPoints([firstOutlier || firstNonOutlier]);
    }, [data]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handlePointSelect = (point) => {
        if (shiftPressed) {
            const pointExists = selectedPoints.find(
                ({PCA1, PCA2}) => point.PCA1 === PCA1 && point.PCA2 === PCA2
            );

            if (!pointExists) {
                setSelectedPoints([...selectedPoints, point]);
            }
        } else {
            setSelectedPoints([point]);
        }

        setRefTopLeft(null);
    };

    const handleMouseUp = () => {
        const x1 = Math.min(refTopLeft?.x, refBottomRight?.x);
        const x2 = Math.max(refTopLeft?.x, refBottomRight?.x);
        const y1 = Math.min(refTopLeft?.y, refBottomRight?.y);
        const y2 = Math.max(refTopLeft?.y, refBottomRight?.y);

        if (x1 && y1 && x2 && y2) {
            const filteredData = data.filter(
                ({PCA1, PCA2}) => inRange(PCA1, x1, x2) && inRange(PCA2, y1, y2)
            );

            if (shiftPressed) {
                setSelectedPoints([...selectedPoints, ...filteredData]);
            } else {
                setSelectedPoints([...filteredData]);
            }
        } else if (!shiftPressed) {
            setSelectedPoints([]);
        }
        setMultiSelect(false);
        setRefTopLeft(null);
        setRefBottomRight(null);
    };

    const outliers = useMemo(() => {

        return data
            .filter(({outlier}) => outlier)
            .map((d) => ({
                size:
                      selectedPoints.find(({PCA1}) => d.PCA1 === PCA1) &&
                      selectedPoints.find(({PCA2}) => d.PCA2 === PCA2) ?
                          LARGE_DOT_SIZE :
                          MEDIUM_DOT_SIZE,
                ...d
            }));
    }, [data, selectedPoints]);

    const novelty = useMemo(() => {

        return data.filter(({outlier, novelty}) => !outlier && novelty)
            .map((d) => ({
                size:
                      selectedPoints.find(({PCA1}) => d.PCA1 === PCA1) &&
                      selectedPoints.find(({PCA2}) => d.PCA2 === PCA2) ?
                          LARGE_DOT_SIZE :
                          MEDIUM_DOT_SIZE,
                ...d
            }));
    }, [data, selectedPoints]);

    const inliers = useMemo(() => {

        return data.filter(({outlier, novelty}) => !outlier && !novelty)
            .map((d) => ({
                size:
                      selectedPoints.find(({PCA1}) => d.PCA1 === PCA1) &&
                      selectedPoints.find(({PCA2}) => d.PCA2 === PCA2) ?
                          LARGE_DOT_SIZE :
                          SMALL_DOT_SIZE,
                ...d
            }));
    }, [data, selectedPoints]);

    return (
        <>
            <Row className='border rounded p-3 w-100 scatterGraph' ref={ref}>
                <Col lg={4} className='scatterGraph-leftBox' style={{userSelect: 'none'}}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart
                            onMouseDown={(e) => {
                                if (e?.xValue && e?.yValue) {
                                    setRefTopLeft({x: e?.xValue, y: e?.yValue});
                                    setMultiSelect(true);
                                    setRefBottomRight(null);
                                }
                            }}
                            onMouseUp={handleMouseUp}
                            onMouseMove={(e) => {
                                if (multiSelect) {
                                    setRefBottomRight({x: e?.xValue, y: e?.yValue});
                                }
                            }}
                        >
                            <CartesianGrid strokeDasharray='6 2' stroke={theme.light} />
                            <XAxis
                                type='number'
                                dataKey='PCA1'
                                name='PCA1'
                                label={{
                                    value: 'PCA1',
                                    position: 'insideBottom',
                                    offset: 10,
                                    fill: theme.secondary
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={() => null}
                                tickCount={10}
                                xAxisId='PCA1'
                            />
                            <YAxis
                                type='number'
                                dataKey='PCA2'
                                name='PCA2'
                                label={{
                                    value: 'PCA2',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: 20,
                                    fill: theme.secondary
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={() => null}
                                tickCount={10}
                                yAxisId='PCA2'
                            />
                            <ZAxis
                                type='number'
                                dataKey='size'
                                range={[SMALL_DOT_SIZE, LARGE_DOT_SIZE]}
                                scale='linear'
                            />
                            <Legend wrapperStyle={{bottom: '10px'}} fill='black' />
                            <defs>
                                <linearGradient id='colorGrad' x1='0' y1='0' x2='1' y2='0'>
                                    <stop offset='50%' stopColor={theme.warning} stopOpacity={1} />
                                    <stop offset='50%' stopColor={theme.success} stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name={outliersAreMislabeled ? 'Suspicious' : 'Outlier'}
                                data={outliers}
                                fill={theme.warning}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            {!outliersAreMislabeled ? (
                                <Scatter
                                    isAnimationActive={false}
                                    cursor='pointer'
                                    onClick={handlePointSelect}
                                    name={noveltyIsObsolete ? 'Obsolete' : 'Novelty'}
                                    data={novelty}
                                    fill={noveltyIsObsolete ? theme.dark : theme.success}
                                    xAxisId='PCA1'
                                    yAxisId='PCA2'
                                />
                            ) : null}
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name={outliersAreMislabeled ? 'Normal' : 'Inlier'}
                                data={inliers}
                                fill={theme.primary}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            {refTopLeft && refBottomRight ? (
                                <ReferenceArea
                                    fillOpacity={0.3}
                                    x1={refTopLeft.x}
                                    y1={refTopLeft.y}
                                    x2={refBottomRight.x}
                                    y2={refBottomRight.y}
                                    xAxisId='PCA1'
                                    yAxisId='PCA2'
                                />
                            ) : null}
                        </ScatterChart>
                    </ResponsiveContainer>
                </Col>

                <Col lg={8} className='rounded p-3 bg-white-blue'>
                    <div className='text-dark m-0 bold-text d-flex justify-content-between'>
                        <div>
                            Examples
                        </div>
                        <div>
                            <AddFilters
                                filters={[new Filter({
                                    left: 'request_id',
                                    op: 'in',
                                    right: sampleRequestIds
                                })]}
                                tooltipText='Filter-in these examples'
                            />
                            <AddFilters
                                filters={[new Filter({
                                    left: 'request_id',
                                    op: 'not in',
                                    right: sampleRequestIds
                                })]}
                                tooltipText='Filter-out these examples'
                                solidIcon
                            />
                            <OverlayTrigger overlay={<Tooltip>Download samples as JSON</Tooltip>}>
                                <button
                                    className='text-dark border-0 bg-transparent click-down fs-2'
                                    onClick={() => {

                                        saveAs(new Blob([JSON.stringify(selectedPoints)], {type: 'application/json;charset=utf-8'}), 'samples.json');
                                    }}>
                                    <IoDownloadOutline className='fs-2 cursor-pointer'/>
                                </button>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={<Tooltip>Mine for Similar Datapoints</Tooltip>}>
                                <button
                                    className='text-dark border-0 bg-transparent click-down fs-2' onClick={() => {
                                        setMinerModalOpen(true);
                                    }}>
                                    <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer'/>
                                </button>
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                        {samples.length ? samples.map((sample, i) => (
                            examplesType === 'video' || examplesType === 'image' ? (
                                <FrameWithBoundingBox
                                    videoUrl={examplesType === 'video' ? sample : null}
                                    imageUrl={examplesType === 'image' ? sample['image_metadata.uri'] : null}
                                    videoControls={false}
                                    frameW={sample['image_metadata.width']}
                                    frameH={sample['image_metadata.height']}
                                    boxW={sample['image_metadata.object.width']}
                                    boxH={sample['image_metadata.object.height']}
                                    boxT={sample['image_metadata.object.top']}
                                    boxL={sample['image_metadata.object.left']}
                                    height={200}
                                    onClick={() => setExampleInModal(sample)}
                                />

                            ) :
                                examplesType === 'text' ?
                                    <div
                                        key={i}
                                        className='d-flex cursor-pointer'
                                        onClick={() => setExampleInModal(sample)}
                                    >
                                        <pre>{JSON.stringify(sample, null, 4)}</pre>
                                    </div> :
                                    null

                        )) : (
                            <h3 className='text-secondary m-0'>No Examples Available</h3>
                        )}
                    </div>
                </Col>
            </Row>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setExampleInModal(null)} title='Example'>
                    {examplesType === 'video' || examplesType === 'image' ? (
                        <FrameWithBoundingBox
                            videoUrl={examplesType === 'video' ? exampleInModal : null}
                            imageUrl={examplesType === 'image' ? exampleInModal['image_metadata.uri'] : null}
                            videoControls
                            frameW={exampleInModal['image_metadata.width']}
                            frameH={exampleInModal['image_metadata.height']}
                            boxW={exampleInModal['image_metadata.object.width']}
                            boxH={exampleInModal['image_metadata.object.height']}
                            boxT={exampleInModal['image_metadata.object.top']}
                            boxL={exampleInModal['image_metadata.object.left']}
                            height={600}
                            zoomable
                        />
                    ) : examplesType === 'text' ?
                        <pre>{JSON.stringify(exampleInModal, null, 4)}</pre> :
                        null
                    }
                </Modal>
            )}
            <MinerModal isOpen={minerModalOpen} closeCallback={() => setMinerModalOpen(false)} requestIds={selectedPoints.map((p) => p['request_id'])}/>
        </>
    );
};

ScatterGraph.propTypes = {
    data: PropTypes.array.isRequired,
    noveltyIsObsolete: PropTypes.bool,
    outliersAreMislabeled: PropTypes.bool
};

export default ScatterGraph;
