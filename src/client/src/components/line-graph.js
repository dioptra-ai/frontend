import {Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import theme from '../styles/theme.module.scss';

const CustomTooltip = ({payload, label}) => {

    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark fw-bold fs-5 m-0'>{payload[0].value.toFixed(3)}</p>
                <p className='text-secondary m-0 label'>
                    {label}
                </p>
            </div>
        );
    }

    return null;
};

CustomTooltip.propTypes = {
    label: PropTypes.any,
    payload: PropTypes.array
};

const LineGraph = ({
    title,
    dots,
    hasDot = true,
    color = theme.primary,
    xAxisName = '',
    tickFormatter,
    xAxisInterval,
    yAxisName = '',
    yAxisDomain,
    graphType = 'linear'
}) => {

    return (
        <div className='border rounded p-3' style={{height: '425px'}}>
            <p className='text-dark fw-bold fs-5'>{title}</p>
            <ResponsiveContainer height='87%' width='100%'>
                <ComposedChart
                    data={dots}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 35
                    }}
                >
                    <CartesianGrid strokeDasharray='5 5' />
                    <XAxis
                        dataKey='x'
                        dy={5}
                        interval={xAxisInterval}
                        label={{fill: theme.dark, value: xAxisName, dy: 30, fontSize: 12}}
                        stroke='transparent'
                        tick={{fill: theme.secondary, fontSize: 12}}
                        tickFormatter={(tick) => tickFormatter ? tickFormatter(tick) : tick}
                    />
                    <YAxis
                        domain={yAxisDomain}
                        dx={-5}
                        label={{fill: theme.dark, value: yAxisName, angle: -90, dx: -20, fontSize: 12}}
                        stroke='transparent'
                        tick={{fill: theme.secondary, fontSize: 12}}
                        tickCount={6}
                    />
                    <Tooltip content={<CustomTooltip />}/>
                    <defs>
                        <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                            <stop offset='5%' stopColor={color} stopOpacity={0.7}/>
                            <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <Line connectNulls dataKey='y' dot={hasDot} fill={color} stroke={color} strokeWidth={2} type={graphType}/>
                    <Area dataKey='y' fill='url(#color)' stroke={color} strokeWidth={2} type={graphType} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

LineGraph.propTypes = {
    color: PropTypes.string,
    dots: PropTypes.array,
    graphType: PropTypes.string,
    hasDot: PropTypes.bool,
    tickFormatter: PropTypes.func,
    title: PropTypes.string,
    xAxisInterval: PropTypes.number,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default LineGraph;
