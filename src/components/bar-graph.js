import { BarChart, Bar, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const Legend = ({data}) => {
    return (
        <ul className='bar-graph-legend my-2 p-0'>
            {
                data.map((item, index) => (
                    <li className='text-secondary mx-2' key={index}>
                        <span className='square' style={{backgroundColor: item.fill}}></span>
                        <p>{item.name}</p>
                    </li>
                ))
            }
        </ul>
    );
};

Legend.propTypes = {
    data: PropTypes.array,
};

const BarGraph = ({title, bars, yAxisName}) => {
    const barValues = {};
    bars.forEach((c, i) => {
        if (c.value) barValues[`key_${i}`] = c.value;
    });

    const data = [
        barValues
    ];
    return(
        <div className='border rounded p-3' style={{height: '350px'}}>
            <p className='text-dark fw-bold fs-5'>{title}</p>
            <ResponsiveContainer width='100%' height='70%'>
                <BarChart
                    data={data}
                    barSize={45}
                    barGap={40}
                    margin={{
                        top: 10,
                        right: 40,
                        left: 0,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid strokeDasharray='5 5' vertical={false}/>
                    <YAxis domain={[0, 100]} dx={-5} stroke='transparent' tickCount={6} tick={{fill: '#8C9AA7'}} label={{ fill: '#405364', value: yAxisName, angle: -90, dx: -20, fontSize: 12 }}/>
                    {bars.map((bar, i) => (
                        <Bar key={i} fill={bar.fill} dataKey={`key_${i}`} label={{ fill: '#405364', fontSize: 18, position: 'top', fontWeight: 'bold'}}/>
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