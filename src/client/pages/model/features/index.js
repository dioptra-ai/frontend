import PropTypes from 'prop-types';
import hash from 'string-hash';
import {Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis} from 'recharts';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import useAllFilters from 'hooks/use-all-filters';
import {Tooltip as BarTooltip} from 'components/bar-graph';
import theme from 'styles/theme.module.scss';
import Table from 'components/table';

const Features = () => {
    const allFilters = useAllFilters();

    return (
        <Async
            fetchData={() => metricsClient('features', {
                filters: allFilters
            })}
            renderData={(data) => {
                return (
                    <Table
                        columns={[{
                            Header: 'Feature Name',
                            accessor: 'label'
                        }, {
                            Header: 'Type',
                            accessor: 'type'
                        }, {
                            id: 'histogram',
                            Header: 'Histogram',
                            Cell: HistogramCell
                        }, {
                            Header: 'Feature Importance',
                            accessor: 'importance'
                        }, {
                            Header: 'Drift',
                            accessor: 'drift'
                        }, {
                            Header: 'Prediction Drift Impact',
                            accessor: 'pdi'
                        }]}
                        data={data.map((feature) => {
                            const {label, value: histogram} = feature;
                            const importance = Number(hash(JSON.stringify(feature)) / 4294967295);
                            const drift = Number(hash(`${JSON.stringify(feature)}.`) / 4294967295);

                            return {
                                label, histogram,
                                type: 'FLOAT',
                                importance: importance.toFixed(4),
                                drift: drift.toFixed(4),
                                pdi: Number(importance * drift).toFixed(4)
                            };
                        })}
                    />
                );
            }}
        />
    );
};

export default Features;

const HistogramCell = ({cell}) => {
    const {histogram: [hist, bins]} = cell.row.original;

    return (
        <>
            <ResponsiveContainer height={60} width='100%'>
                <BarChart data={hist.map((v, i) => ({
                    name: `${Number(bins[i]).toFixed(2)} - ${Number(bins[i + 1]).toFixed(2)}`,
                    value: v
                }))}>
                    <Tooltip content={<BarTooltip />} />
                    <Bar background={false} dataKey='value' minPointSize={2}>
                        {hist.map((v, i) => (
                            <Cell accentHeight='0px' fill={theme.primary} key={i} />
                        ))}
                    </Bar>
                    <XAxis dataKey='name' tick={false} hide/>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};

HistogramCell.propTypes = {
    cell: PropTypes.object
};
