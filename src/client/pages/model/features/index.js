import PropTypes from 'prop-types';
import {Tooltip as OverlayTooltip, OverlayTrigger} from 'react-bootstrap';
import {AiOutlineCheckCircle} from 'react-icons/ai';
import hash from 'string-hash';
import {Bar, BarChart, Cell, Tooltip, XAxis} from 'recharts';
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
            refetchOnChanged={[allFilters]}
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
                            Cell: HistogramCell,
                            disableSortBy: true
                        }, {
                            Header: 'Global Feature Importance',
                            accessor: 'importance',
                            Cell: ToFixed4Cell,
                            sortType: 'basic'
                        }, {
                            Header: 'Global Drift',
                            accessor: 'drift',
                            Cell: ToFixed4Cell,
                            sortType: 'basic'
                        }, {
                            Header: 'Global Drift Impact',
                            accessor: 'gdi',
                            Cell: GDICell,
                            sortType: 'basic'
                        }, {
                            Header: 'Segment Max Drift Impact',
                            accessor: 'sdi',
                            Cell: SDICell,
                            sortType: 'basic'
                        }, {
                            Header: 'Quality',
                            Cell: QualityCell
                        }]}
                        data={data.map((feature) => {
                            const {label, value: histogram} = feature;
                            const importance = Number(hash(JSON.stringify(feature)) / 4294967295);
                            const drift = Number(hash(`${JSON.stringify(feature)}.`) / 4294967295) / 4;
                            const gdi = importance * drift;

                            let sdi = Number(hash(`${JSON.stringify(feature)}.`) / 4294967295) / 4.1;

                            if (label.endsWith('title')) {
                                sdi = Number(hash(`${JSON.stringify(feature)}.`) / 4294967295) / 2;
                            }

                            return {
                                label,
                                histogram,
                                type: 'FLOAT',
                                importance,
                                drift,
                                gdi,
                                sdi
                            };
                        })}
                    />
                );
            }}
        />
    );
};

export default Features;

const ToFixed4Cell = ({cell}) => {
    return (
        <span>{Number(cell.value).toFixed(4)}</span>
    );
};

ToFixed4Cell.propTypes = {
    cell: PropTypes.object
};

const GDICell = ({cell}) => {
    const {gdi} = cell.row.original;

    return (
        <span style={{color: gdi > 0.3 ? theme.danger : 'inherit'}}>
            {gdi.toFixed(4)}
        </span>
    );
};

GDICell.propTypes = {
    cell: PropTypes.object
};

const SDICell = ({cell}) => {
    const {sdi} = cell.row.original;

    return (
        <OverlayTrigger show={sdi > 0.3} overlay={(
            <OverlayTooltip id='sdi-tooltip'>Detected drift in the segment <pre>tags.browser = safari</pre></OverlayTooltip>
        )}>
            <span style={{color: sdi > 0.3 ? theme.danger : 'inherit'}}>
                {sdi.toFixed(4)}
            </span>
        </OverlayTrigger>
    );
};

SDICell.propTypes = {
    cell: PropTypes.object
};

const HistogramCell = ({cell}) => {
    const {histogram: [hist, bins]} = cell.row.original;

    return (
        <div className='w-100 d-flex justify-content-center' style={{width: 200, height: 60}}>
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
        </div>
    );
};

HistogramCell.propTypes = {
    cell: PropTypes.object
};

const QualityCell = () => {

    return (
        <AiOutlineCheckCircle color={theme.success} size={20} />
    );
};
