import {useRef, useState} from 'react';
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
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
const SMALL_DOT_SIZE = 60;

const ClusterGraph = ({chartWidth = 4, examplesWidth = 8, children}) => {
    const ref = useRef();
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [exampleInModal, setExampleInModal] = useModal(false);

    const samples = selectedPoints?.reduce(
        (combinedSamples, {samples}) => [...combinedSamples, samples],
        []
    );

    return (
        <>
            <Row className='border rounded p-3 w-100 scatterGraph' ref={ref}>
                <Col lg={chartWidth} className='scatterGraph-leftBox' style={{userSelect: 'none'}}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart>
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
                            {children({setSelectedPoints})}
                        </ScatterChart>
                    </ResponsiveContainer>
                </Col>
                <Col lg={examplesWidth} className='rounded p-3 bg-white-blue'>
                    <p className='text-dark m-0 bold-text'>Examples</p>
                    <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                        {samples.length ? samples.map((sample, i) => (
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
                            </div>
                        )) : (
                            <h3 className='text-secondary m-0'>No Examples Available</h3>
                        )}
                    </div>
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

ClusterGraph.propTypes = {
    chartWidth: PropTypes.number,
    examplesWidth: PropTypes.number,
    children: PropTypes.func.isRequired
};

export default ClusterGraph;
