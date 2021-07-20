import {Bar, BarChart, CartesianGrid, ResponsiveContainer, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import Legend from './graph-legend';
import theme from '../styles/theme.module.scss';

const BarGraph = ({title, bars, yAxisName}) => {
    const barValues = {};

    bars.forEach((c, i) => {
        if (c.value) barValues[`key_${i}`] = c.value;
    });

    const data = [
        barValues
    ];


    return (
        <div className='border rounded p-3' style={{height: '425px'}}>
            <p className='text-dark fw-bold fs-5'>{title}</p>
            <ResponsiveContainer height='70%' width='100%'>
                <BarChart
                    barGap={40}
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
                        domain={[0, (dataMax) => (dataMax + dataMax / 6)]}
                        dx={-5}
                        label={{fill: theme.dark, value: yAxisName, angle: -90, dx: -20, fontSize: 12}}
                        stroke='transparent'
                        tick={{fill: theme.secondary, fontSize: 12}}
                        tickCount={6}
                    />
                    {bars.map((bar, i) => (
                        <Bar
                            dataKey={`key_${i}`}
                            fill={bar.fill} key={i}
                            label={{fill: theme.dark, fontSize: 18, position: 'top', fontWeight: 'bold'}}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
            <Legend data={bars}/>
        </div>
    );
};

BarGraph.propTypes = {
    bars: PropTypes.array,
    title: PropTypes.string,
    yAxisName: PropTypes.string
};

export default BarGraph;
