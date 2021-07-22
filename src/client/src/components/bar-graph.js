import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import Legend from './graph-legend';
import theme from '../styles/theme.module.scss';

const BarGraph = ({title, bars, yAxisName, yAxisDomain}) => {
    const data = bars.map(({name, value}) => ({[name]: value}));

    return (
        <div className='border rounded p-3 w-100'>
            <p className='text-dark fw-bold fs-5'>{title}</p>
            <div style={{height: '300px'}}>
                <ResponsiveContainer height='100%' width='100%'>
                    <BarChart
                        barGap={bars.length <= 3 ? -60 : 0 }
                        barSize={45}
                        data={data}
                        margin={{
                            top: 10,
                            right: 40,
                            left: 0,
                            bottom: 10
                        }}
                    >
                        <CartesianGrid strokeDasharray='5 5' vertical={false}/>
                        <YAxis
                            domain={yAxisDomain ? yAxisDomain : [0, (dataMax) => (Math.round(dataMax + dataMax / 6))]}
                            dx={-5}
                            label={{fill: theme.dark, value: yAxisName, angle: -90, dx: -20, fontSize: 12}}
                            stroke='transparent'
                            tick={{fill: theme.secondary, fontSize: 12}}
                            tickCount={6}
                        />
                        <Tooltip cursor={false} labelFormatter={() => ''} wrapperClassName='shadow border-0 rounded'/>
                        {bars.map(({name, fill}, i) => {
                            return (
                                <Bar
                                    dataKey={name}
                                    fill={fill} key={i}
                                    label={bars.length <= 6 ? {fill: theme.dark, fontSize: 18, position: 'top', fontWeight: 'bold'} : false}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {bars.length <= 6 && <Legend data={bars}/>}
        </div>
    );
};

BarGraph.propTypes = {
    bars: PropTypes.array,
    title: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default BarGraph;
