import PropTypes from 'prop-types';
import {
    CartesianGrid,
    Legend,
    ReferenceArea,
    ResponsiveContainer,
    ScatterChart,
    XAxis,
    YAxis,
    ZAxis
} from 'recharts';
import {useThrottle} from '@react-hook/throttle';
import theme from 'styles/theme.module.scss';

const LARGE_DOT_SIZE = 200;
const SMALL_DOT_SIZE = 60;

const ScatterGraph = ({onAreaSelected, children}) => {
    const [refTopLeft, setRefTopLeft] = useThrottle(null, 10, true);
    const [refBottomRight, setRefBottomRight] = useThrottle(null, 10, true);

    const handleMouseUp = () => {
        const left = Math.min(refTopLeft?.x, refBottomRight?.x);
        const right = Math.max(refTopLeft?.x, refBottomRight?.x);
        const top = Math.min(refTopLeft?.y, refBottomRight?.y);
        const bottom = Math.max(refTopLeft?.y, refBottomRight?.y);

        onAreaSelected?.({left, right, top, bottom});

        if (refTopLeft) {
            setRefTopLeft(null);
            setRefBottomRight(null);
        }
    };

    return (
        <div style={{userSelect: 'none'}} className='w-100 h-100'>
            <ResponsiveContainer width='100%' height='100%'>
                <ScatterChart
                    onMouseDown={(e) => {
                        if (onAreaSelected && e?.xValue && e?.yValue) {
                            setRefTopLeft({x: e?.xValue, y: e?.yValue});
                            setRefBottomRight(null);
                        }
                    }}
                    onMouseUp={handleMouseUp}
                    onMouseMove={(e) => {
                        if (refTopLeft) {
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
                    <Legend wrapperStyle={{bottom: -10}} fill='black' />
                    <defs>
                        <linearGradient id='colorGrad' x1='0' y1='0' x2='1' y2='0'>
                            <stop offset='50%' stopColor={theme.warning} stopOpacity={1} />
                            <stop offset='50%' stopColor={theme.success} stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    {children}
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
        </div>
    );
};

ScatterGraph.propTypes = {
    onAreaSelected: PropTypes.func,
    children: PropTypes.node
};

export default ScatterGraph;
