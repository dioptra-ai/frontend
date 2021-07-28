import PropTypes from 'prop-types';
import moment from 'moment';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {setupComponent} from 'helpers/component-helper';
import theme from '../styles/theme.module.scss';
import {formatDateTime} from '../helpers/date-helper';

const CustomTooltip = ({payload, label}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark fw-bold fs-5 m-0'>{payload[0].value.toFixed(1)}</p>
                <p className='text-secondary m-0 label'>
                    {formatDateTime(moment(label))}
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
    yAxisName = '',
    yAxisDomain,
    graphType = 'linear',
    margin = {
        top: 10,
        right: 30,
        left: 0,
        bottom: 35
    },
    unit,
    timeStore
}) => {
    const data = dots.map((d) => ({
        y: Math.floor(d.y),
        x: new Date(d.x).getTime()
    }));
    const granularity = timeStore.getTimeGranularity();
    const domain = timeStore.rangeMillisec;

    let filledData = [];

    if (data.length) {
        const dataSpan = data[data.length - 1].x - data[0].x;

        const ticks = new Array(Math.floor(dataSpan / granularity)).fill().map((_, i) => data[0].x + i * granularity);
        const timeSeries = data.reduce((agg, d) => ({
            ...agg,
            [d.x]: d
        }), {});

        filledData = ticks.map((x) => timeSeries[x] || {x});
    }

    return (
        <div className={`${hasBorder ? 'border px-3' : ''} rounded py-3 w-100`} >
            {title && <p className='text-dark fw-bold fs-5'>{title}</p>}
            <div style={{height: '355px'}}>
                <ResponsiveContainer height='100%' width='100%'>
                    <AreaChart data={filledData}
                        margin={margin}>
                        <CartesianGrid strokeDasharray='5 5' />
                        <defs>
                            <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='10%' stopColor={color} stopOpacity={0.7}/>
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9}/>
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey='x'
                            domain={domain}
                            dy={5}
                            interval={xAxisInterval}
                            label={{fill: theme.dark, value: xAxisName, dy: 30, fontSize: 12}}
                            scale='time'
                            stroke='transparent'
                            tick={{fill: theme.secondary, fontSize: 12}}
                            tickCount={5}
                            tickFormatter={(tick) => tickFormatter ? tickFormatter(tick) : tick}
                            type='number'
                        />
                        <YAxis
                            domain={yAxisDomain}
                            dx={-5}
                            label={{fill: theme.dark, value: yAxisName, angle: -90, dx: -20, fontSize: 12}}
                            stroke='transparent'
                            tick={{fill: theme.secondary, fontSize: 12}}
                            tickCount={6}
                            unit={unit}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Area
                            dataKey='y'
                            dot={hasDot ? {fill: color} : false}
                            fill='url(#color)'
                            stroke={color}
                            strokeWidth={2}
                            type={graphType}
                        />
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
    margin: PropTypes.object,
    tickFormatter: PropTypes.func,
    timeStore: PropTypes.object.isRequired,
    title: PropTypes.string,
    unit: PropTypes.string,
    xAxisInterval: PropTypes.number,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default setupComponent(AreaGraph);
