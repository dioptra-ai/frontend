import {useMemo} from 'react';
import {Bar, BarChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import PropTypes from 'prop-types';
import fontSizes from '../styles/font-sizes.module.scss';
import {SpinnerWrapper} from 'components/spinner';
import theme from 'styles/theme.module.scss';

// eslint-disable-next-line complexity
const BarGraph = ({
    title, bars, unit, yAxisName, xAxisName, verticalIfMoreThan = 10, sortBy = 'name',
    yAxisDomain = ([dataMin, dataMax]) => [Math.min(0, dataMin), Math.max(0, dataMax)],
    // Probably should be this instead:
    // yAxisTickFormatter={(v) => Number(v).toLocaleString()}
    yAxisTickFormatter = (value) => Number(value).toFixed?.(2) || '-',
    className = '', onClick, children, height, ...rest
}) => {
    const dataMax = Math.max(...bars.map((i) => i.value));
    const numCategories = Array.from(new Set(bars.map((i) => i.name))).length;
    const horizontalLayout = numCategories <= verticalIfMoreThan;

    const sortedBars = sortBy ? useMemo(() => {
        return bars.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
    }, [bars, sortBy]) : bars;

    return (
        <div className={`border rounded p-3 w-100 ${className}`}>
            <SpinnerWrapper>
                <div className='text-dark bold-text fs-4 px-3 mb-3'>{title}</div>
                <div style={{height: height || horizontalLayout ? 300 : Math.max(300, 25 * numCategories)}}>
                    <ResponsiveContainer height='100%' width='100%'>
                        <BarChart data={sortedBars}
                            layout={horizontalLayout ? 'horizontal' : 'vertical'}
                            {...rest}
                        >
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis
                                domain={horizontalLayout ? undefined : yAxisDomain}
                                orientation={horizontalLayout ? (dataMax <= 0 ? 'top' : 'bottom') : undefined}
                                dataKey={horizontalLayout ? 'name' : undefined}
                                label={{
                                    value: horizontalLayout ? xAxisName : yAxisName,
                                    fontSize: fontSizes.fs_7
                                }}
                                tickFormatter={horizontalLayout ? undefined : yAxisTickFormatter}
                                tick={{fontSize: fontSizes.fs_7}}
                                unit={horizontalLayout ? undefined : unit}
                                type={horizontalLayout ? 'category' : 'number'}
                            />
                            <YAxis
                                domain={horizontalLayout ? yAxisDomain : undefined}
                                orientation={horizontalLayout ? undefined : (dataMax <= 0 ? 'right' : 'left')}
                                dataKey={horizontalLayout ? undefined : 'name'}
                                label={{
                                    value: horizontalLayout ? yAxisName : xAxisName,
                                    angle: horizontalLayout ? -90 : 45,
                                    dx: -20,
                                    fontSize: fontSizes.fs_7
                                }}
                                tickFormatter={horizontalLayout ? yAxisTickFormatter : undefined}
                                tick={{fontSize: fontSizes.fs_7}}
                                unit={horizontalLayout ? unit : undefined}
                                type={horizontalLayout ? 'number' : 'category'}
                            />
                            <Tooltip
                                contentStyle={{borderRadius: 3, border: 'none', boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)'}}
                                wrapperStyle={{outline: 'none'}}
                                formatter={(value) => Number(value).toLocaleString() + (unit || '')}
                            />
                            {children ||
                                <>
                                    <Bar cursor={onClick ? 'pointer' : 'default'} onClick={onClick} dataKey='value' fill={theme.primary} maxBarSize={50} minPointSize={2}/>
                                </>
                            }
                            {bars.length > 100 && horizontalLayout ? (
                                <Brush dataKey='name' height={30} stroke={theme.primary}/>
                            ) : null}
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
    onClick: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.node,
    yAxisTickFormatter: PropTypes.func,
    verticalIfMoreThan: PropTypes.number,
    sortBy: PropTypes.string
};

export default BarGraph;
