import {useEffect, useState} from 'react';
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
const ScatterGraph = ({data}) => {
    const [samples, setSamples] = useState([]);
    const [exampleInModal, setExampleInModal] = useModal(false);

    const modifiedData = data.map((d) => ({...d, size: d.outlier ? 20 : 14}));

    useEffect(() => {
        const {samples} = data.find(({outlier}) => outlier);

        if (samples) {
            setSamples(samples);
        } else {
            setSamples(data[0]?.samples);
        }
    }, [data]);

    const handleClick = ({samples}) => setSamples(samples || []);

    return (
        <>
            <Row className='border rounded p-3 w-100 scatterGraph'>
                <Col lg={4} className='scatterGraph-leftBox'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray='6 2' />
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
                            <ZAxis type='number' dataKey='size' range={[10, 100]} />
                            <Tooltip content={CustomTooltip} />
                            <Legend wrapperStyle={{bottom: '-5px'}} />
                            <Scatter
                                onClick={handleClick}
                                name='Outlier'
                                data={modifiedData.filter(({outlier}) => outlier)}
                                fill='#F8886C'
                            />
                            <Scatter
                                onClick={handleClick}
                                name='Non-Outlier'
                                data={modifiedData.filter(({outlier}) => !outlier)}
                                fill='#1FA9C8'
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </Col>

                <Col lg={8} className='rounded p-3 bg-white-blue'>
                    <p className='text-dark m-0 bold-text'>Examples</p>
                    <div
                        className={`d-flex p-4 overflow-auto flex-grow-1 justify-content-center ${
                            !samples.length ? 'align-items-center' : ''
                        } scatterGraph-examples`}
                    >
                        {samples.length ? (
                            samples.map((sample, i) => (
                                <div
                                    key={i}
                                    className='d-flex justify-content-center align-items-center p-2 m-5 bg-white scatterGraph-item'
                                    onClick={() => setExampleInModal(sample)}
                                >
                                    {sample}
                                </div>
                            ))
                        ) : (
                            <h3 className='text-primary m-0'>No Examples Available</h3>
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

ScatterGraph.propTypes = {
    data: PropTypes.array
};

export default ScatterGraph;
