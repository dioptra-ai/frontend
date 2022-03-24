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
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import DateTimeRangePicker from 'components/date-time-range-picker';
import Async from 'components/async';
import theme from 'styles/theme.module.scss';
import useModal from 'hooks/useModal';
import useModel from 'hooks/use-model';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'components/modal';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';
import moment from 'moment';
import {lastMilliseconds} from 'helpers/date-helper';

const LARGE_DOT_SIZE = 200;
const MEDIUM_DOT_SIZE = 100;
const SMALL_DOT_SIZE = 60;

const inRange = (num, min, max) => num >= min && num <= max;

const ScatterGraph = ({data, noveltyIsObsolete}) => {
    const ref = useRef();
    const model = useModel();
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
    const [minerDatasetSelected, setMinerDatasetSelected] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState();
    const [referencePeriod, setReferencePeriod] = useState();
    const samples = selectedPoints?.map(({sample}) => sample);
    const sampleRequestIds = selectedPoints?.map(({request_id}) => request_id);
    const examplesType = samples.every((s) => (/^https?:\/\//).test(s)) ? 'image' : 'text';

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

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

    const onDatasetDateChange = ({start, end, lastMs}) => {
        let isoStart = null;
        let isoEnd = null;

        if (lastMs) {
            const e = moment();
            const s = lastMilliseconds(lastMs)[0];
            isoStart = s.toISOString();
            isoEnd = e.toISOString();
        } else {
            isoStart = start.toISOString();
            isoEnd = end.toISOString();
        }
        setReferencePeriod({start: isoStart, end: isoEnd});
    };

    const createMiner = () => {
        const requestIds = selectedPoints.map(selectedPoint => selectedPoint.request_id)
        const payload = {
            request_ids: requestIds,
        }
        if (!minerDatasetSelected) {
            payload['reference_period'] = referencePeriod;
        } else {
            payload['dataset'] = selectedDataset;
        }
        metricsClient("/miners", payload)
    }

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
                                name='Outlier'
                                data={outliers}
                                fill={theme.warning}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
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
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name='Inlier'
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
                        </div>
                        <OverlayTrigger overlay={<Tooltip>Download samples as JSON</Tooltip>}>
                            <IoDownloadOutline className='fs-2 cursor-pointer' onClick={() => {

                                saveAs(new Blob([JSON.stringify(selectedPoints)], {type: 'application/json;charset=utf-8'}), 'samples.json');
                            }}/>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>Mine for Similar Datapoints</Tooltip>}>
                            <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer' onClick={() => {
                                setMinerModalOpen(true);
                            }}/>
                        </OverlayTrigger>
                    </div>
                    <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                        {samples.length ? samples.map((sample, i) => (
                            examplesType === 'image' ?
                                <div
                                    key={i}
                                    className='d-flex justify-content-center align-items-center m-4 bg-white scatterGraph-item cursor-pointer'
                                    onClick={() => setExampleInModal(sample)}
                                >
                                    <img
                                        alt='Example'
                                        className='rounded modal-image'
                                        src={sample}
                                        width='100%'
                                    />
                                </div> :
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
                    {examplesType === 'image' ?
                        <img
                            alt='Example'
                            className='rounded modal-image'
                            src={exampleInModal}
                            style={{maxHeight: '80vh', maxWidth: '80vw'}}
                        /> :
                        examplesType === 'text' ?
                            <pre>{JSON.stringify(exampleInModal, null, 4)}</pre> :
                            null}
                </Modal>
            )}
            {minerModalOpen ? (
                <Modal isOpen onClose={() => setMinerModalOpen(false)} title='Mine for Similar Datapoints'>
                    <div style={{width: 500}}>
                                    Create a new miner that will search for datapoints that are close to the selected {samples.length} examples in the embedding space.
                    </div>
                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        createMiner();
                        // setMinerModalOpen(false);
                    }}>
                        <Form.Label className='mt-3 mb-0 w-100'>
                                        Source
                        </Form.Label>
                        <InputGroup className='mt-1 flex-column'>
                            <Form.Control
                                as='select'
                                className={'form-select bg-light w-100'}
                                custom
                                required
                                onChange={(e) => {
                                    setMinerDatasetSelected(e.target.value === 'true');
                                }}
                            >
                                <option disabled>
                                    Select Source
                                </option>
                                <option value={false}>Live traffic of "{model.name}"</option>
                                <option value={true}>Dataset</option>
                            </Form.Control>
                        </InputGroup>
                        {
                            !minerDatasetSelected && (
                                <InputGroup className='mt-1'>
                                    <Form.Label className='mt-3 mb-0 w-100'>
                                        Date range
                                    </Form.Label>
                                    <DateTimeRangePicker
                                        datePickerSettings={{
                                            opens: 'center'
                                        }}
                                        end={referencePeriod ? moment(referencePeriod.end) : null}
                                        onChange={onDatasetDateChange}
                                        start={referencePeriod ? moment(referencePeriod.start) : null}
                                        width='100%'
                                    />
                                </InputGroup>
                            )}
                        {
                            minerDatasetSelected ? (
                                <>
                                    <Form.Label className='mt-3 mb-0 w-100'>
                                        Dataset
                                    </Form.Label>
                                    <InputGroup className='mt-1'>
                                        <Async
                                            fetchData={() => metricsClient('datasets', null, 'get')}
                                            renderData={(datasets) => (
                                                <Form.Control
                                                    as='select'
                                                    className={'form-select bg-light w-100'}
                                                    custom
                                                    required
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value != 'desc') {
                                                            setSelectedDataset(value)
                                                        }
                                                    }}
                                                >
                                                    <option value="desc">
                                                    Select Dataset
                                                    </option>
                                                    {datasets.map((dataset) => {
                                                        return <option value={dataset.dataset_id}>{dataset.dataset_id}</option>;
                                                    })}
                                                </Form.Control>
                                            )}
                                        />
                                    </InputGroup>
                                </>
                            ) : null
                        }
                        <Button
                            className='w-100 text-white btn-submit mt-3'
                            variant='primary' type='submit'>Create Miner</Button>
                    </Form>
                </Modal>
            ) : null}
        </>
    );
};

ScatterGraph.propTypes = {
    data: PropTypes.array.isRequired,
    noveltyIsObsolete: PropTypes.bool
};

export default ScatterGraph;
