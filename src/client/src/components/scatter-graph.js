import {useState} from 'react';
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import PropTypes from 'prop-types';

const CustomTooltip = ({payload}) => {
    if (payload && payload.length) {
        return (
            <div className='line-graph-tooltip bg-white p-3'>
                <p className='text-dark bold-text fs-5 m-0'>{payload[0].name}: {payload[0].value}</p>
                <p className='text-dark bold-text fs-5 m-0'>{payload[1].name}: {payload[1].value}</p>
            </div>
        );
    } else return null;
};

CustomTooltip.propTypes = {
    payload: PropTypes.array
};
const ScatterGraph = ({data}) => {
    const [samples, setSamples] = useState([]);

    const handleClick = ({samples}) => setSamples(samples || []);

    return (
        <div className={`border rounded p-3 d-flex justify-content-between ${samples.length ? 'w-100' : ''}`}>
            <div style={{height: 480, width: 360}}>
                <ResponsiveContainer width='100%' height='100%'>
                    <ScatterChart
                    >
                        <CartesianGrid />
                        <XAxis
                            type='number'
                            dataKey='PCA1'
                            name='PCA1'
                            label={{value: 'PCA1', position: 'insideBottom', offset: -10}}
                        />
                        <YAxis
                            type='number'
                            dataKey='PCA2'
                            name='PCA2'
                            label={{value: 'PCA2', angle: -90, position: 'insideLeft'}}
                        />
                        <Tooltip content={CustomTooltip} />
                        <Legend wrapperStyle={{bottom: '-5px'}} />
                        <Scatter
                            onClick={handleClick}
                            name='Outlier'
                            data={data.filter(({outlier}) => outlier)}
                            fill='#8884d8'
                        />
                        <Scatter
                            onClick={handleClick}
                            name='Non-outlier'
                            data={data.filter(({outlier}) => !outlier)}
                            fill='#82ca9d'
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            {samples.length ?
                <div className='rounded p-3 w-100 my-1 flex-grow-1 bg-white-blue' style={{border: '2px solid #dee2e6', marginLeft: '1rem'}}>
                    <p className='text-dark m-0 bold-text flex-grow-1'>Examples</p>
                    <div className='d-flex p-4 overflow-auto' style={{flexWrap: 'wrap', maxHeight: 440}}>
                        {samples.map((sample, i) => <div key={i} className='d-flex justify-content-center align-items-center p-2 m-4 bg-white' style={{width: 140, height: 180}}>{sample}</div>)}
                    </div>
                </div> :
                null}
        </div>
    );
};

ScatterGraph.propTypes = {
    data: PropTypes.array
};

export default ScatterGraph;
