import {useEffect, useRef, useState} from 'react';
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
import theme from 'styles/theme.module.scss';
import PropTypes from 'prop-types';
import useModal from 'customHooks/useModal';
import BtnIcon from 'components/btn-icon';
import {IconNames} from 'constants';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from 'components/modal';

const LARGE_DOT_SIZE = 200;
const MEDIUM_DOT_SIZE = 100;
const SMALL_DOT_SIZE = 60;

const min = (n, m) => (n < m ? n : m);
const max = (n, m) => (n > m ? n : m);

const inRange = (num, min, max) => num >= min && num <= max;

const ScatterGraph = ({data}) => {
    const ref = useRef();
    const firstOutlier = data.find(({outlier}) => outlier);
    const firstNonOutlier = data.find(({outlier}) => !outlier);
    const [selectedPoint, setSelectedPoint] = useState(
        firstOutlier || firstNonOutlier
    );
    const [exampleInModal, setExampleInModal] = useModal(false);
    const [shiftPressed, setShiftPressed] = useState(false);
    const [samples, setSamples] = useState([]);
    const [refTopLeft, setRefTopLeft] = useState(null);
    const [refBottomRight, setRefBottomRight] = useState(null);
    const [multiSelect, setMultiSelect] = useState(false);

    const handleKeyDown = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(true);
    };

    const handleKeyUp = ({keyCode}) => {
        if (keyCode === 16) setShiftPressed(false);
    };

    useEffect(() => {
        setSamples([...selectedPoint?.samples]);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handlePointSelect = (point) => {
        setSelectedPoint(point);
        if (shiftPressed) {
            setSamples([...samples, ...(point?.samples || [])]);
        } else setSamples([...(point?.samples || [])]);
    };

    const handleMouseUp = () => {
        const x1 = min(refTopLeft?.x, refBottomRight?.x);
        const x2 = max(refTopLeft?.x, refBottomRight?.x);
        const y1 = min(refTopLeft?.y, refBottomRight?.y);
        const y2 = max(refTopLeft?.y, refBottomRight?.y);

        if (x1 && y1 && x2 && y2) {
            const filteredData = data.filter(
                ({PCA1, PCA2}) => inRange(PCA1, x1, x2) && inRange(PCA2, y1, y2)
            );

            const multiSamples = filteredData.reduce(
                (samples, d) => [...samples, ...(d.samples || [])],
                []
            );

            setSamples(multiSamples);
        }
        setMultiSelect(false);
    };

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
                                if (multiSelect) setRefBottomRight({x: e?.xValue, y: e?.yValue});
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
                            <ZAxis type='number' dataKey='size' range={[SMALL_DOT_SIZE, LARGE_DOT_SIZE]} />
                            <Legend wrapperStyle={{bottom: '-10px'}} fill='black'/>
                            <defs>
                                <linearGradient id='colorGrad' x1='0' y1='0' x2='1' y2='0'>
                                    <stop offset='50%' stopColor={theme.warning} stopOpacity={1}/>
                                    <stop offset='50%' stopColor={theme.success} stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name='Outlier'
                                data={data.filter(({outlier, novelty}) => outlier && !novelty).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : MEDIUM_DOT_SIZE,
                                    ...d
                                }))}
                                fill={theme.warning}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name='Novelty'
                                data={data.filter(({outlier, novelty}) => !outlier && novelty).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : MEDIUM_DOT_SIZE,
                                    ...d
                                }))}
                                fill={theme.success}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                legendType='none'
                                data={data.filter(({outlier, novelty}) => outlier && novelty).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : MEDIUM_DOT_SIZE,
                                    ...d
                                }))}
                                fill='url(#colorGrad)'
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={handlePointSelect}
                                name='Inlier'
                                data={data.filter(({outlier, novelty}) => !outlier && !novelty).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : SMALL_DOT_SIZE,
                                    ...d
                                }))}
                                fill={theme.primary}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                            {refTopLeft && refBottomRight ? (
                                <ReferenceArea
                                    strokeOpacity={0.3}
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
                    <p className='text-dark m-0 bold-text'>Examples</p>
                    {samples.length ? (
                        <div
                            className={
                                'd-flex p-2 overflow-auto flex-grow-1 justify-content-left scatterGraph-examples'
                            }
                        >
                            {samples.map((sample, i) => (
                                <div
                                    key={i}
                                    className='d-flex justify-content-center align-items-center m-4 bg-white scatterGraph-item'
                                    onClick={() => setExampleInModal(sample)}
                                >
                                    <img
                                        alt='Example'
                                        className='rounded modal-image'
                                        src={sample}
                                        width='100%'
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className={
                                'd-flex p-2 overflow-auto flex-grow-1 justify-content-center align-items-center scatterGraph-examples'
                            }
                        >
                            <h3 className='text-secondary m-0'>No Examples Available</h3>
                        </div>
                    )}
                </Col>
            </Row>
            {exampleInModal && (
                <Modal isOpen={true} onClose={() => setExampleInModal(null)}>
                    <div className='d-flex align-items-center'>
                        <p className='m-0 flex-grow-1'></p>
                        <BtnIcon
                            className='border-0'
                            icon={IconNames.CLOSE}
                            onClick={() => setExampleInModal(null)}
                            size={15}
                        />
                    </div>
                    <img
                        alt='Example'
                        className='rounded modal-image'
                        src={exampleInModal}
                        width='100%'
                    />
                </Modal>
            )}
        </>
    );
};

ScatterGraph.propTypes = {
    data: PropTypes.array.isRequired
};

export default ScatterGraph;
