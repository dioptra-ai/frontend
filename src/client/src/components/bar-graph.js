import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import Legend from './graph-legend';
import fontSizes from '../styles/font-sizes.module.scss';
import {SpinnerWrapper} from 'components/spinner';

const CustomTooltip = ({payload, label, unit}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>{Number(payload[0]).value.toFixed(4)}{unit}</p>
                <p className='text-secondary m-0 fs-7' style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: 200
                }}>
                    {label === '' ? '<empty>' : label}
                </p>
            </div>
        );
    } else return null;
};

CustomTooltip.propTypes = {
    label: PropTypes.any,
    payload: PropTypes.array,
    unit: PropTypes.string
};
const BarGraph = ({title, bars, unit, yAxisName, xAxisName, yAxisDomain, className = '', onClick}) => {

    return (
        <div className={`border rounded p-3 pe-5 w-100 ${className}`}>
            <SpinnerWrapper>
                <p className='text-dark bold-text fs-4 px-3'>{title}</p>
                <div style={{height: '300px'}}>
                    <ResponsiveContainer height='100%' width='100%'>
                        <BarChart data={bars} height={250} width={730}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis
                                dataKey='name'
                                label={{
                                    value: xAxisName,
                                    fontSize: fontSizes.fs_7
                                }}
                                tick={{fontSize: fontSizes.fs_7}}
                            />
                            <YAxis
                                domain={yAxisDomain}
                                label={{
                                    value: yAxisName,
                                    angle: -90,
                                    dx: -20,
                                    fontSize: fontSizes.fs_7
                                }}
                                tick={{fontSize: fontSizes.fs_7}}
                                unit={unit}
                            />
                            <Tooltip content={<CustomTooltip unit={unit}/>}/>
                            {bars.length > 4 && bars.length < 9 ? <Legend data={bars}/> : null}
                            <Bar cursor={onClick ? 'pointer' : 'default'} onClick={onClick} dataKey='value' fill='#8884d8' maxBarSize={50} minPointSize={2}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SpinnerWrapper>
        </div>
    );
};

BarGraph.propTypes = {
    bars: PropTypes.array,
    className: PropTypes.string,
    title: PropTypes.node,
    unit: PropTypes.string,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string,
    onClick: PropTypes.func
};

export default BarGraph;
