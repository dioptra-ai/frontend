import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
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

const AreaGraph = ({
    title,
    dots,
    hasBorder = true,
    hasDot = true,
    color = theme.primary,
    xAxisName = '',
    tickFormatter,
    xAxisInterval,
    xAxisTicks,
    yAxisName = '',
    yAxisDomain,
    graphType = 'linear',
    margin = {
        top: 10,
        right: 30,
        left: 0,
        bottom: 35
    },
    hasWarnings = false
}) => {

    return (
        <div className={`${hasBorder ? 'border px-3' : ''} rounded py-3`} >
            {title && <p className='text-dark fw-bold fs-5'>{title}</p>}
            <div style={{height: '300px'}}>
                <ResponsiveContainer height='100%' width='100%'>
                    <AreaChart
                        data={dots}
                        margin={margin}
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
                            ticks={xAxisTicks}
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
                                <stop offset='10%' stopColor={color} stopOpacity={0.7}/>
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='10%' stopColor={theme.warning} stopOpacity={0.7}/>
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <Area
                            connectNulls
                            dataKey='y'
                            dot={hasDot ? {fill: color} : false}
                            fill='url(#color)'
                            stroke={color}
                            strokeWidth={2}
                            type={graphType}
                        />
                        {hasWarnings &&
                            <Area
                                connectNulls
                                dataKey='warning'
                                dot={hasDot ? {fill: theme.warning} : false}
                                fill='url(#warning)'
                                stroke={theme.warning}
                                strokeWidth={2}
                                type={graphType}
                            />
                        }
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

AreaGraph.propTypes = {
    color: PropTypes.string,
    dots: PropTypes.array,
    graphType: PropTypes.string,
    hasBorder: PropTypes.bool,
    hasDot: PropTypes.bool,
    hasWarnings: PropTypes.bool,
    margin: PropTypes.object,
    tickFormatter: PropTypes.func,
    title: PropTypes.string,
    xAxisInterval: PropTypes.number,
    xAxisName: PropTypes.string,
    xAxisTicks: PropTypes.array,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default AreaGraph;
