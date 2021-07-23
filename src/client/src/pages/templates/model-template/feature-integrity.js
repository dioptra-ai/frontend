import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import {Area, Bar, BarChart, Cell, ComposedChart, Line, Tooltip} from 'recharts';
import {useInView} from 'react-intersection-observer';


import {FeatureIntegrityTableColumnNames, IconNames} from 'constants';
import {getRandomHexColor} from 'helpers/color-helper';
import FontIcon from 'components/font-icon';
import theme from 'styles/theme.module.scss';
import {setupComponent} from 'helpers/component-helper';
import timeseriesClient from 'clients/timeseries';

const FeatureIntegrityTableColumnConfigs = [
    {name: FeatureIntegrityTableColumnNames.FEATURE_NAME},
    {name: FeatureIntegrityTableColumnNames.INCIDENT_COUNT},
    {name: FeatureIntegrityTableColumnNames.TYPE},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS},
    {name: FeatureIntegrityTableColumnNames.KS_TEST},
    {name: FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS}
];
const mockKSTest = [{x: '17:20', y: 0.4}, {x: '17:23', y: 0.46}, {x: '17:26', y: 0.7}, {x: '17:32', y: 0.32}, {x: '17:42', y: 0.42}];

const renderWarningCheckIcon = (isOk, fontSize) => {
    const iconName = isOk ? IconNames.CHECK : IconNames.WARNING;
    const colorClass = `text-${isOk ? 'success' : 'warning'}`;

    return (
        <FontIcon className={colorClass} icon={iconName} size={fontSize} />
    );
};

const KSTestTooltip = ({payload}) => {
    if (payload && payload.length) {
        const data = payload[0].payload;

        return (
            <div className='p-3 bg-white shadow-lg'>
                <div className='fw-bold'>{data.y.toFixed(2)}</div>
                <div className='text-secondary'><small>{data.x}</small></div>
            </div>
        );
    }

    return null;
};

KSTestTooltip.propTypes = {
    payload: PropTypes.array
};

const renderKSTestLineChart = (data, isValid) => {
    const color = theme.primary;
    const invalidClasses = 'border border-2 border-warning';

    return (
        <div className={`p-2 ${isValid ? '' : invalidClasses}`} style={{width: 'fit-content'}}>
            {isValid ? null : <div className='d-flex justify-content-end'>{renderWarningCheckIcon(isValid, 25)}</div>}
            <ComposedChart data={data} height={100} width={180}>
                <defs>
                    <linearGradient id='areaColor' x1='0' x2='0' y1='0' y2='1'>
                        <stop offset='5%' stopColor={color} stopOpacity={0.7}/>
                        <stop offset='95%' stopColor='#FFFFFF' stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Line connectNulls dataKey='y' fill={color} stroke={color} strokeWidth={2} type='linear'/>
                <Area dataKey='y' fill='url(#areaColor)' stroke={color} strokeWidth={2} type='linear' />
                <Tooltip content={<KSTestTooltip />} />
            </ComposedChart>
        </div>
    );
};

const OnlineDistributionTooltip = ({payload}) => {
    if (payload && payload.length) {
        const {payload: {value, dist}} = payload[0];

        return (
            <div className='p-3 bg-white shadow-lg'>
                <div>{(100 * Number(dist)).toFixed(2)}%</div>
                <div className='text-secondary'><small>{value || '<empty>'}</small></div>
            </div>
        );
    }

    return null;
};

OnlineDistributionTooltip.propTypes = {
    payload: PropTypes.array
};

const OnlineDistributionBarChart = ({distribution}) => {
    return distribution ? (
        <div>
            <BarChart data={distribution} height={120} width={150}>
                <Bar background={false} dataKey='dist'>
                    {distribution.map((d, i) => (
                        <Cell accentHeight='0px' fill={d.color} key={i}/>
                    ))}
                </Bar>
                <Tooltip content={<OnlineDistributionTooltip />} cursor={false}/>
            </BarChart>
        </div>
    ) : null;
};

OnlineDistributionBarChart.propTypes = {
    distribution: PropTypes.array
};

const FeatureIntegrityRow = ({name, timeStore}) => {
    const incidentCount = 4;
    const tdClasses = 'py-5 align-middle';
    const [featureType, setFeatureType] = useState(null);
    const [featureOnlineDistribution, setFeatureOnlineDistribution] = useState(null);
    const {ref, inView} = useInView();

    useEffect(() => {

        if (inView) {


            timeseriesClient({
                query: `
                  SELECT "${name}" FROM "dioptra-gt-combined-eventstream"
                  WHERE "${name}" IS NOT NULL
                    AND ${timeStore.sQLTimeFilter}
                  LIMIT 100
                `
            }).then((values) => {

                if (values.some((v) => isNaN(v[name]))) {
                    setFeatureType('String');
                } else {
                    setFeatureType('Number');
                }
            }).catch(console.error);

            timeseriesClient({
                query: `
                        select 
                          cast(my_table.my_count as float) / cast(my_count_table.total_count as float) AS "dist", 
                          my_table."${name}" AS "value"
                          from (
                              SELECT count(*) as my_count, "${name}"
                              FROM "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sQLTimeFilter}
                              GROUP BY 2
                              LIMIT 100
                          ) as my_table
                          NATURAL JOIN (
                              SELECT count(*) as total_count
                              FROM "dioptra-gt-combined-eventstream"
                              WHERE ${timeStore.sQLTimeFilter}
                              LIMIT 100
                          ) as my_count_table
                        `
            }).then((values) => {

                setFeatureOnlineDistribution(values);
            }).catch(console.error);
        }
    }, [inView, timeStore.sQLTimeFilter]);

    return (
        <tr className='py-5' ref={ref}>
            <td className={tdClasses} colSpan={2}>
                <div className='fw-bold'>{name}</div>
                <div className='text-secondary'><small>Lorem Ipsum</small></div>
            </td>
            <td className={tdClasses}>
                <div className='d-flex align-items-center justify-content-center'>
                    {renderWarningCheckIcon(incidentCount === 0, 25)}
                    {incidentCount > 0 ? <span className='ms-1 text-warning'>{incidentCount}</span> : ''}
                </div>
            </td>
            <td className={tdClasses}>{featureType}</td>
            <td className={tdClasses}>
                <OnlineDistributionBarChart distribution={featureOnlineDistribution?.map(({value, dist}) => ({
                    value, dist,
                    color: getRandomHexColor(0.65)
                }))}/>
            </td>
            <td className={tdClasses}>
                {['Top 4 values', '5684: 15%', '8902: 29.7%', '0058: 2.1%', '6001: 0.12%']
                    .map((s, i) => <div key={i}>{s.name}</div>)}
            </td>
            <td className={tdClasses}>{renderKSTestLineChart(mockKSTest, true)}</td>
            <td className={tdClasses}>
                {['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
                    .map((s, i) => <div className='d-flex' key={i}>{s.name}</div>)}
            </td>
        </tr>
    );
};

FeatureIntegrityRow.propTypes = {
    name: PropTypes.string,
    timeStore: PropTypes.object
};

const ObserverFeatureIntegrityRow = setupComponent(FeatureIntegrityRow);

const FeatureIntegrityTable = ({errorStore, timeStore}) => {
    const [allFeatureNames, setAllFeatureNames] = useState(null);
    const [nonNullFeatureNames, setNonNullFeatureNames] = useState([]);

    useEffect(() => {
        timeseriesClient({
            query: `
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'dioptra-gt-combined-eventstream'
                `
        }).then((res) => {
            setAllFeatureNames(res.map((row) => row['COLUMN_NAME']));
        }).catch((e) => errorStore.reportError(e));
    }, []);

    useEffect(() => {

        if (allFeatureNames) {

            timeseriesClient({
                query: `
                    SELECT ${allFeatureNames.map((f) => `COUNT("${f}")`).join(', ')}
                    FROM "dioptra-gt-combined-eventstream"
                    WHERE ${timeStore.sQLTimeFilter}
                `,
                resultFormat: 'array'
            }).then(([nonNullCounts]) => {

                setNonNullFeatureNames(allFeatureNames.filter((_, i) => nonNullCounts && nonNullCounts[i] !== 0));
            }).catch((e) => errorStore.reportError(e));
        }
    }, [allFeatureNames, timeStore.sQLTimeFilter]);

    return (
        <div className='border border-1 px-3 pb-3 pt-2'>
            <Table>
                <thead>
                    <tr>
                        {FeatureIntegrityTableColumnConfigs.map((c, idx) => (<th className={`text-secondary pb-3 ${idx === 0 ? 'w-25' : ''} ${idx === 1 ? 'text-center' : ''}`} colSpan={idx > 0 ? 1 : 2} key={c.name}>{c.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {nonNullFeatureNames.map((f) => <ObserverFeatureIntegrityRow key={f} name={f}/>)}
                </tbody>
            </Table>
        </div>
    );
};

FeatureIntegrityTable.propTypes = {
    errorStore: PropTypes.object,
    timeStore: PropTypes.object
};

export default setupComponent(FeatureIntegrityTable);
