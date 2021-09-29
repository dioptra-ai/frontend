import {useState} from 'react';
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
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

const CustomTooltip = ({payload}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>
                    {payload[0].name}: {payload[0].value}
                </p>
                <p className='text-dark bold-text fs-5 m-0'>
                    {payload[1].name}: {payload[1].value}
                </p>
            </div>
        );
    } else return null;
};

CustomTooltip.propTypes = {
    payload: PropTypes.array
};
const LARGE_DOT_SIZE = 200;
const MEDIUM_DOT_SIZE = 100;
const SMALL_DOT_SIZE = 60;
const ScatterGraph = ({data}) => {
    const firstOutlier = data.find(({outlier}) => outlier);
    const firstNonOutlier = data.find(({outlier}) => !outlier);
    const [selectedPoint, setSelectedPoint] = useState(firstOutlier || firstNonOutlier);
    const [exampleInModal, setExampleInModal] = useModal(false);
    const samples = selectedPoint?.samples || [];

    return (
        <>
            <Row className='border rounded p-3 w-100 scatterGraph'>
                <Col lg={4} className='scatterGraph-leftBox'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray='6 2' stroke={theme.light}/>
                            <XAxis
                                type='number'
                                dataKey='PCA1'
                                name='PCA1'
                                label={{
                                    value: 'PCA1',
                                    position: 'insideBottom',
                                    offset: 0,
                                    fill: theme.secondary
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={() => null}
                                tickCount={10}
                            />
                            <YAxis
                                type='number'
                                dataKey='PCA2'
                                name='PCA2'
                                label={{
                                    value: 'PCA2',
                                    angle: -90,
                                    position: 'insideLeft',
                                    fill: theme.secondary
                                }}
                                axisLine={false}
                                tickLine={false}
                                tick={() => null}
                                tickCount={10}
                            />
                            <ZAxis type='number' dataKey='size' range={[SMALL_DOT_SIZE, LARGE_DOT_SIZE]} />
                            <Tooltip content={CustomTooltip} />
                            <Legend wrapperStyle={{bottom: '-5px'}} />
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={setSelectedPoint}
                                name='Outlier'
                                data={data.filter(({outlier}) => outlier).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : MEDIUM_DOT_SIZE,
                                    ...d
                                }))}
                                fill='#F8886C'
                            />
                            <Scatter
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={setSelectedPoint}
                                name='Non-Outlier'
                                data={data.filter(({outlier}) => !outlier).map((d) => ({
                                    size: d.PCA1 === selectedPoint.PCA1 && d.PCA2 === selectedPoint.PCA2 ? LARGE_DOT_SIZE : SMALL_DOT_SIZE,
                                    ...d
                                }))}
                                fill='#1FA9C8'
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </Col>

                <Col lg={8} className='rounded p-3 bg-white-blue'>
                    <p className='text-dark m-0 bold-text'>Examples</p>
                    {samples.length ? (
                        <div
                            className={'d-flex p-2 overflow-auto flex-grow-1 justify-content-left scatterGraph-examples'}
                        >{
                                samples.map((sample, i) => (
                                    <div
                                        key={i}
                                        className='d-flex justify-content-center align-items-center m-4 bg-white scatterGraph-item'
                                        onClick={() => setExampleInModal(sample)}
                                    >
                                        {sample}
                                    </div>
                                ))

                            } </div>
                    ) : (
                        <div
                            className={'d-flex p-2 overflow-auto flex-grow-1 justify-content-center align-items-center scatterGraph-examples'}
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
