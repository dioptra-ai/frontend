import {useMemo} from 'react';
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
import {VscZoomOut} from 'react-icons/vsc';
import {SpinnerWrapper} from 'components/spinner';

import theme from 'styles/theme.module.scss';
import {formatDateTime} from 'helpers/date-helper';
import {setupComponent} from 'helpers/component-helper';
import fontSizes from 'styles/font-sizes.module.scss';

export const CustomTooltip = ({payload, label, precisionDigits = 4}) => {
    if (payload && payload.length) {
        const [{value, unit}] = payload;

        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>
                    {Number(value).toFixed(precisionDigits)}
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
    precisionDigits: PropTypes.number
};

const AreaGraph = ({
    title,
    dots,
    hasBorder = true,
    color = theme.primary,
    xAxisName = '',
    yAxisName = '',
    yAxisDomain,
    margin = {
        top: 10,
        right: 30,
        left: 0,
        bottom: 35
    },
    unit,
    timeStore,
    xDataKey = 'x',
    yDataKey = 'y'
}) => {
    const granularityMs = timeStore.getTimeGranularity().asMilliseconds();
    const domain = timeStore.rangeMillisec;
    const [showBtn, setShowBtn] = useThrottle(false);
    const [refAreaLeft, setRefAreaLeft] = useThrottle(null, 25, true);
    const [refAreaRight, setRefAreaRight] = useThrottle(null, 25, true);

    const filledData = useMemo(() => {
        const data = dots.map((d) => ({
            [yDataKey]: d[yDataKey],
            [xDataKey]: new Date(d[xDataKey]).getTime()
        }));

        const [domainStart, domainEnd] = domain;
        const referencePoint = data.find((d) => domainStart < d[xDataKey] && d[xDataKey] < domainEnd);

        if (!referencePoint) {

            return [];
        } else {
            // We'll generate a completely synthetic set of ticks evenly spaced
            // aligned on the first datapoint we find inside the domain.
            const referenceTick = referencePoint[xDataKey];
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
                [d[xDataKey]]: d
            }), {});

            // Now we populate our nice ticks list with the data that's available.
            return ticks.map((tick) => timeSeries[tick] || {
                [xDataKey]: tick
            });
        }
    }, [JSON.stringify(dots), JSON.stringify(domain)]);

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
        <div
            className={`${hasBorder ? 'border px-3' : ''} rounded py-3 w-100`}
            style={{userSelect: 'none'}}
        >
            <SpinnerWrapper>
                {title && <div className='text-dark bold-text fs-4 px-3 pb-2'>{title}</div>}
                <div
                    onMouseEnter={() => setShowBtn(true)}
                    onMouseLeave={() => setShowBtn(false)}
                    onMouseMove={() => setShowBtn(true)}
                    style={{
                        height: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}
                >
                    {showBtn && (
                        <VscZoomOut
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
                        />
                    )}
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
                            <CartesianGrid strokeDasharray='5 5' stroke={theme.light} />
                            <defs>
                                <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                                    <stop
                                        offset='10%'
                                        stopColor={color}
                                        stopOpacity={0.7}
                                    />
                                    <stop
                                        offset='90%'
                                        stopColor='#FFFFFF'
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                                    <stop
                                        offset='10%'
                                        stopColor={theme.warning}
                                        stopOpacity={0.9}
                                    />
                                    <stop
                                        offset='90%'
                                        stopColor='#FFFFFF'
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey={xDataKey}
                                domain={domain}
                                dy={5}
                                interval='preserveStartEnd'
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
                                tickFormatter={(tick) => formatDateTime(tick, granularityMs)
                                }
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
                                yAxisId='1'
                                unit={unit}
                            />
                            <Tooltip content={CustomTooltip} />
                            <Area
                                animationDuration={300}
                                dataKey={yDataKey}
                                fill='url(#color)'
                                stroke={color}
                                strokeWidth={2}
                                type='linear'
                                yAxisId='1'
                                unit={unit}
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
            </SpinnerWrapper>
        </div>
    );
};

AreaGraph.propTypes = {
    color: PropTypes.string,
    dots: PropTypes.array,
    hasBorder: PropTypes.bool,
    margin: PropTypes.object,
    timeStore: PropTypes.object.isRequired,
    title: PropTypes.node,
    unit: PropTypes.string,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string,
    xDataKey: PropTypes.string,
    yDataKey: PropTypes.string
};

export default setupComponent(AreaGraph);

export const SmallChart = setupComponent(({
    timeStore, data, unit, xDataKey = 'x', yDataKey = 'y', hasTooltip = false
}) => (
    <ResponsiveContainer height='100%' width='100%'>
        <AreaChart data={data.map((d) => ({
            [yDataKey]: d[yDataKey],
            [xDataKey]: new Date(d[xDataKey]).getTime()
        }))}>
            <defs>
                <linearGradient id='color' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='10%' stopColor={theme.primary} stopOpacity={0.7}/>
                    <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id='warning' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='10%' stopColor={theme.warning} stopOpacity={0.9}/>
                    <stop offset='90%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <XAxis
                axisLine={false}
                dataKey={xDataKey}
                domain={timeStore.rangeMillisec}
                scale='time'
                tick={false}
                type='number'
            />
            <Area
                dataKey={yDataKey}
                fill='url(#color)'
                stroke={theme.primary}
                strokeWidth={2}
                unit={unit}
            />
            {hasTooltip ? <Tooltip content={CustomTooltip} allowEscapeViewBox={{x: true, y: true}}/> : null}
        </AreaChart>
    </ResponsiveContainer>
));

