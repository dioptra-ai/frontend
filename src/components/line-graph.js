import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const CustomTooltip = ({ payload, label }) => {
  if (payload && payload.length) {
    return (
      <div className="line-graph-tooltip bg-white p-3">
        <p className="text-dark fw-bold fs-5 m-0">{payload[0].value}</p>
        <p className="text-secondary m-0">{label}</p>
      </div>
    );
  }

  return null;
};

const LineGraph = ({title, dots, color='#1FA9C8', xAxisName='', yAxisName=''}) => {

  return(
    <div className='border rounded p-3' style={{height: '350px'}}>
      <p className="text-dark fw-bold fs-5">{title}</p>
      <ResponsiveContainer width='100%' height='87%'>
          <ComposedChart
            data={dots}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 35,
            }}
          >
            <CartesianGrid strokeDasharray='5 5'  />
            <XAxis dataKey='x' tick={{fill: '#8C9AA7'}} dy={5} label={{ fill: '#405364', value: xAxisName, dy: 30, fontSize: 12 }}  stroke='transparent'/>
            <YAxis domain={[0, 1]} stroke='transparent' dx={-5} tickCount={6} tick={{fill: '#8C9AA7'}} label={{ fill: '#405364', value: yAxisName, angle: -90, dx: -20, fontSize: 12 }}/>
            <Tooltip content={<CustomTooltip />}/>
            <defs>
              <linearGradient id='color' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={color} stopOpacity={0.7}/>
                <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Line connectNulls type='linear'  dataKey='y' stroke={color} fill={color}  strokeWidth={2}/>
            <Area type='linear'  dataKey='y' stroke={color}  strokeWidth={2} fill='url(#color)' />
          </ComposedChart>
        </ResponsiveContainer>
    </div>
  );
};

LineGraph.propTypes = {
  color: PropTypes.string,
  dots: PropTypes.array,
  title: PropTypes.string,
  yAxisName: PropTypes.string,
  xAxisName: PropTypes.string,
};

export default LineGraph;