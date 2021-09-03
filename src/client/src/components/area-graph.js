import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {Button} from 'react-bootstrap';
import {setupComponent} from 'helpers/component-helper';
import theme from '../styles/theme.module.scss';
import {formatDateTime} from '../helpers/date-helper';
import fontSizes from '../styles/font-sizes.module.scss';


const CustomTooltip = ({payload, label, unit}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>
                    {payload[0].value.toFixed(1)}
                    {unit}
                </p>
                <p
                    className='text-secondary m-0 fs-7'
                    style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: 200
                    }}
                >
                    {formatDateTime(moment(label))}
                </p>
            </div>
        );
    }

    return null;
};

CustomTooltip.propTypes = {
    label: PropTypes.any,
    payload: PropTypes.array,
    unit: PropTypes.string
};

const AreaGraph = ({
    title,
    dots,
    hasBorder = true,
    color = theme.primary,
    xAxisName = '',
    xAxisInterval,
    yAxisName = '',
    yAxisDomain,
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
    const granularityMs = timeStore.getTimeGranularityMs();
    const domain = timeStore.rangeMillisec;

    const [filledData, setFilledData] = useState([]);
    const [showBtn, setShowBtn] = useState(false);

    useEffect(() => {
        if (data.length) {
            const dataSpan = data[data.length - 1].x - data[0].x;

            const ticks = new Array(Math.floor(dataSpan / granularityMs))
                .fill()
                .map((_, i) => data[0].x + i * granularityMs);
            const timeSeries = data.reduce(
                (agg, d) => ({
                    ...agg,
                    [d.x]: d
                }),
                {}
            );

            setFilledData([...ticks.map((x) => timeSeries[x] || {x})]);
        }
    }, []);

    const zoomIn = (e) => {
        const halfRange = filledData[filledData.length - 1].x - filledData[0].x;

        const start = e.activeLabel - halfRange;
        const end = e.activeLabel + halfRange;

        timeStore.setTimeRange({start, end});

    };

    const zoomOut = () => {
        const doubleRange = (filledData[filledData.length - 1].x - filledData[0].x) * 3;
        const start = filledData[0].x - doubleRange;
        const end = filledData[filledData.length - 1].x + doubleRange;

        timeStore.setTimeRange({start, end});
    };

    return (
        <div className={`${hasBorder ? 'border px-3' : ''} rounded py-3 w-100`}>
            {title && <p className='text-dark bold-text fs-4'>{title}</p>}
            <div onMouseEnter={() => setShowBtn(true)}
                onMouseLeave={() => setShowBtn(false)}
                style={{height: '355px', display: 'flex', flexDirection: 'column', position: 'relative'}}
            >
                {showBtn && <Button
                    className='text-white px-4 py-2 ms-3'
                    onClick={zoomOut}
                    style={{position: 'absolute', right: 20, zIndex: 1, top: -40}}
                    variant='primary'
                >
                    <span className='fs-6 bold-text'>Zoom Out</span>
                </Button>}
                <ResponsiveContainer height='100%' width='100%'>
                    <AreaChart
                        data={filledData}
                        margin={margin}
                        onClick={zoomIn}
                    >
                        <CartesianGrid strokeDasharray='5 5' />
                        <defs>
                            <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='10%' stopColor={color} stopOpacity={0.7} />
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                                <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9} />
                                <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey='x'
                            domain={domain}
                            dy={5}
                            interval={xAxisInterval}
                            label={{
                                fill: theme.dark,
                                value: xAxisName,
                                dy: 30,
                                fontSize: fontSizes.fs_7
                            }}
                            scale='time'
                            stroke='transparent'
                            tick={{fill: theme.secondary, fontSize: fontSizes.fs_7}}
                            tickCount={5}
                            tickFormatter={(tick) => formatDateTime(tick, granularityMs)}
                            type='number'
                        />
                        <YAxis
                            domain={yAxisDomain}
                            dx={-5}
                            label={{
                                fill: theme.dark,
                                value: yAxisName,
                                angle: -90,
                                dx: -20,
                                fontSize: fontSizes.fs_7
                            }}
                            stroke='transparent'
                            tick={{fill: theme.secondary, fontSize: fontSizes.fs_7}}
                            tickCount={6}
                            unit={unit}
                        />
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Area
                            animationDuration={300}
                            dataKey='y'
                            fill='url(#color)'
                            stroke={color}
                            strokeWidth={2}
                            type='linear'
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
    hasBorder: PropTypes.bool,
    margin: PropTypes.object,
    timeStore: PropTypes.object.isRequired,
    title: PropTypes.string,
    unit: PropTypes.string,
    xAxisInterval: PropTypes.number,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default setupComponent(AreaGraph);
