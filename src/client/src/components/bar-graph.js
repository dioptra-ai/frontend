import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import Legend from './graph-legend';
import fontSizes from '../styles/font-sizes.module.scss';

const CustomTooltip = ({payload, label}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>{payload[0].value}</p>
                <p className='text-secondary m-0 fs-7'>{label || '<empty>'}</p>
            </div>
        );
    } else return null;
};

CustomTooltip.propTypes = {
    label: PropTypes.any,
    payload: PropTypes.array
};
const BarGraph = ({title, bars, yAxisName, xAxisName, yAxisDomain}) => {

    return (
        <div className='border rounded p-3 w-100'>
            <p className='text-dark bold-text fs-4'>{title}</p>
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
                        />
                        <Tooltip content={<CustomTooltip/>}/>
                        {bars.length < 6 ? <Legend data={bars}/> : null}
                        <Bar dataKey='value' fill='#8884d8' maxBarSize={50} minPointSize={2}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

BarGraph.propTypes = {
    bars: PropTypes.array,
    title: PropTypes.string,
    xAxisName: PropTypes.string,
    yAxisDomain: PropTypes.array,
    yAxisName: PropTypes.string
};

export default BarGraph;
