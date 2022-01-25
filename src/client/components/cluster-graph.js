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

const LARGE_DOT_SIZE = 200;
const SMALL_DOT_SIZE = 60;

const ClusterGraph = ({children}) => {

    return (
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
                {children}
            </ScatterChart>
        </ResponsiveContainer>
    );
};

ClusterGraph.propTypes = {
    children: PropTypes.node.isRequired
};

export default ClusterGraph;
