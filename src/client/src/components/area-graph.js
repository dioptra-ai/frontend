import {useMemo, useState} from 'react';
import {useThrottle} from '@react-hook/throttle';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {HiOutlineZoomOut} from 'react-icons/hi';

import theme from 'styles/theme.module.scss';
import {formatDateTime} from 'helpers/date-helper';
import {setupComponent} from 'helpers/component-helper';
import fontSizes from 'styles/font-sizes.module.scss';


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

    const [showBtn, setShowBtn] = useState(false);
    const [refAreaLeft, setRefAreaLeft] = useThrottle(null, 25, true);
    const [refAreaRight, setRefAreaRight] = useThrottle(null, 25, true);

    const filledData = useMemo(() => {
        if (data.length > 0) {
            const referenceTick = data[0].x;
            const [domainStart, domainEnd] = domain;
            // Fill the ticks with timestamps aligned with the first datapoint,
            // in both directions.
            const numTicksLeft = Math.floor((referenceTick - domainStart) / granularityMs);
            const numTicksRight = Math.floor((domainEnd - referenceTick) / granularityMs);
            const ticks = [];

            new Array(numTicksLeft).fill().forEach((_, i) => {
                ticks.push(referenceTick - (numTicksLeft - i) * granularityMs);
            });

            // We add one at the end otherwise we won't reach
            // referenceTick + numTicksRight * granularityMs.
            new Array(numTicksRight + 1).fill().forEach((_, i) => {
                ticks.push(referenceTick + i * granularityMs);
            });

            const timeSeries = data.reduce((agg, d) => ({
                ...agg,
                [d.x]: d
            }), {});

            return ticks.map((x) => timeSeries[x] || {x});
        } else {

            return [];
        }
    }, [JSON.stringify(data)]);

    const zoomIn = () => {

        if (refAreaLeft !== refAreaRight && refAreaRight !== null) {
            timeStore.setTimeRange({
                start: Math.min(refAreaLeft, refAreaRight),
                end: Math.max(refAreaLeft, refAreaRight)
            });

        }

        setRefAreaLeft(null);
        setRefAreaRight(null);
    };

    const zoomOut = () => {
        const oldStart = timeStore.start.valueOf();
        const oldEnd = timeStore.end.valueOf();
        const timeRangeCenter = (oldStart + oldEnd) / 2;
        const halfNewTimeRange = oldEnd - oldStart;

        const start = timeRangeCenter - halfNewTimeRange;
        const end = timeRangeCenter + halfNewTimeRange;

        timeStore.setTimeRange({start, end});
    };

    return (
        <div className={`${hasBorder ? 'border px-3' : ''} rounded py-3 w-100`} style={{userSelect: 'none'}}>
            {title && <p className='text-dark bold-text fs-4'>{title}</p>}
            <div onMouseEnter={() => setShowBtn(true)}
                onMouseLeave={() => setShowBtn(false)}
                style={{height: '355px', display: 'flex', flexDirection: 'column', position: 'relative'}}
            >
                {showBtn && <HiOutlineZoomOut
                    className='cursor-pointer'
                    onClick={zoomOut}
                    style={{
                        fontSize: 30,
                        position: 'absolute',
                        right: 40,
                        zIndex: 1,
                        top: 20
                    }}
                    title='Zoom out'
                />}
                <ResponsiveContainer height='100%' width='100%'>
                    <AreaChart
                        data={filledData}
                        margin={margin}
                        onMouseDown={(e) => {
                            setRefAreaLeft(e.activeLabel);
                        }}
                        onMouseMove={(e) => {

                            if (refAreaLeft) {
                                setRefAreaRight(e.activeLabel);
                            }
                        }}
                        onMouseUp={zoomIn}
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
                            yAxisId='1'
                        />
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Area
                            animationDuration={300}
                            dataKey='y'
                            fill='url(#color)'
                            stroke={color}
                            strokeWidth={2}
                            type='linear'
                            yAxisId='1'
                            dot={{
                                r: 1,
                                strokeWidth: 2
                            }}
                        />
                        {refAreaLeft && refAreaRight ? (
                            <ReferenceArea
                                strokeOpacity={0.3}
                                x1={refAreaLeft}
                                x2={refAreaRight}
                                yAxisId='1'
                            />
                        ) : null}
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
