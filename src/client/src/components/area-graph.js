import {useEffect, useState} from 'react';
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

const GraphInitialState = {
    data: [],
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
    top: 'dataMax+1',
    bottom: 'dataMin-1',
    animation: true
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
    const [graphState, setGraphState] = useState({
        ...GraphInitialState
    });

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

    useEffect(() => {
        setGraphState({
            ...graphState,
            data: filledData,
            ...(domain ? {left: domain[0], right: domain[1]} : {}),
            ...(yAxisDomain ? {top: yAxisDomain[0], bottom: yAxisDomain[1]} : {})
        });
    }, [filledData, domain, yAxisDomain]);

    const zoomIn = () => {
        let {refAreaLeft, refAreaRight} = graphState;
        const {data} = graphState;

        if (refAreaLeft === refAreaRight || refAreaRight === '') {
            setGraphState({
                ...graphState,
                refAreaLeft: '',
                refAreaRight: ''
            });

            return;
        }

        if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

        const indexLeft = graphState.data.map(({x}) => x).indexOf(refAreaLeft);
        const indexRight = graphState.data.map(({x}) => x).indexOf(refAreaRight);
        const refData = graphState.data.slice(indexLeft - 1, indexRight);

        let [bottom, top] = [refData[0]['y'], refData[0]['y']];

        refData.forEach((d) => {
            if (d['y'] > top) top = d['y'];
            if (d['y'] < bottom) bottom = d['y'];
        });

        [bottom, top] = [(bottom || 0) - 1, (top || 0) + 1];

        setGraphState({
            refAreaLeft: '',
            refAreaRight: '',
            data: data.slice(),
            left: refAreaLeft,
            right: refAreaRight,
            bottom,
            top
        });
    };

    const zoomOut = () => {
        const {data} = graphState;

        setGraphState({
            data: data.slice(),
            refAreaLeft: '',
            refAreaRight: '',
            left: domain[0],
            right: domain[1],
            top: yAxisDomain ? yAxisDomain[0] : 'dataMax+1',
            bottom: yAxisDomain ? yAxisDomain[1] : 'dataMin'
        });
    };

    return (
        <div className={`${hasBorder ? 'border px-3' : ''} rounded py-3 w-100`} style={{userSelect: 'none'}}>
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
                        data={graphState.data}
                        margin={margin}
                        onMouseDown={(e) => setGraphState({...graphState, refAreaLeft: e.activeLabel})}
                        onMouseMove={(e) => graphState.refAreaLeft && setGraphState({...graphState, refAreaRight: e.activeLabel})}
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
                            domain={[graphState.left, graphState.right]}
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
                            // domain={yAxisDomain}
                            domain={[graphState.bottom, graphState.top]}
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
                        />
                        {graphState.refAreaLeft && graphState.refAreaRight ? (
                            <ReferenceArea strokeOpacity={0.3} x1={graphState.refAreaLeft} x2={graphState.refAreaRight} yAxisId='1' />
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
