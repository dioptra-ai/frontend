import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import {Area, Bar, BarChart, Cell, ComposedChart, Line, Tooltip} from 'recharts';
import {useInView} from 'react-intersection-observer';


import {FeatureIntegrityTableColumnNames, IconNames} from '../../../constants';
import {getRandomHexColor} from '../../../helpers/color-helper';
import FontIcon from '../../../components/font-icon';
import theme from '../../../styles/theme.module.scss';
import {setupComponent} from '../../../helpers/component-helper';
import timeseriesClient from '../../../clients/timeseries';

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
                <div>{data.y.toFixed(3)}</div>
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
        return (<div className='p-3 bg-white shadow-lg'>{payload[0].payload.dist}%</div>);
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
                <Tooltip content={<OnlineDistributionTooltip />} />
            </BarChart>
        </div>
    ) : null;
};

OnlineDistributionBarChart.propTypes = {
    distribution: PropTypes.array
};

const FeatureIntegrityRow = ({name}) => {
    const incidentCount = 4;
    const tdClasses = 'py-5 align-middle';
    const [featureType, setFeatureType] = useState(null);
    const [featureOnlineDistribution, setFeatureOnlineDistribution] = useState(null);
    const {ref, inView} = useInView();

    useEffect(() => {

        if (inView) {

            if (!featureType) {

                timeseriesClient({
                    query: `
                      SELECT "${name}" FROM "dioptra-gt-combined-eventstream"
                      WHERE "${name}" IS NOT NULL LIMIT 100
                    `
                }).then((values) => {

                    if (values.some((v) => isNaN(v[name]))) {
                        setFeatureType('String');
                    } else {
                        setFeatureType('Number');
                    }
                }).catch(console.error);
            }

            if (!featureOnlineDistribution) {

                timeseriesClient({
                    query: `
                            select 
                              cast(my_table.my_count as float) / cast(my_count_table.total_count as float) AS "value", 
                              my_table."${name}"
                              from (
                                  SELECT count(*) as my_count, "${name}"
                                  FROM "dioptra-gt-combined-eventstream"
                                  GROUP BY 2
                                  LIMIT 100
                              ) as my_table
                              NATURAL JOIN (
                                  SELECT count(*) as total_count
                                  FROM "dioptra-gt-combined-eventstream"
                                  LIMIT 100
                              ) as my_count_table
                            `
                }).then((values) => {
                    console.log(values);
                    setFeatureOnlineDistribution(values.map((v) => v.value));
                }).catch(console.error);
            }
        }
    }, [inView]);

    return (
        <tr className='py-5' ref={ref}>
            <td className={tdClasses} colSpan={2}>
                <div className='fw-bold'>{name}</div>
                <div className='text-secondary'><small>Lorem Ipsum</small></div>
            </td>
            <td className={tdClasses}>
                <div className='d-flex align-items-center'>
                    {renderWarningCheckIcon(incidentCount === 0, 25)}
                    {incidentCount > 0 ? <span className='ms-1 text-warning'>{incidentCount}</span> : ''}
                </div>
            </td>
            <td className={tdClasses}>{featureType}</td>
            <td className={tdClasses}>
                <OnlineDistributionBarChart distribution={featureOnlineDistribution?.map((a) => ({dist: a, color: getRandomHexColor(0.65)}))}/>
            </td>
            <td className={tdClasses}>
                {['Top 4 values', '5684: 15%', '8902: 29.7%', '0058: 2.1%', '6001: 0.12%']
                    .map((s) => <div key={s.name}>{s.name}</div>)}
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
    name: PropTypes.string
};

const FeatureIntegrityTable = ({errorStore, model}) => {
    const [featureNames, setFeatureNames] = useState([]);

    useEffect(() => {

        timeseriesClient({
            query: `
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'dioptra-gt-combined-eventstream'
                `
        }).then((res) => {

            const allFeatureNames = res.map((row) => row['COLUMN_NAME']);

            return timeseriesClient({
                query: `
                    SELECT ${allFeatureNames.map((f) => `COUNT("${f}")`).join(', ')}
                    FROM "dioptra-gt-combined-eventstream"
                `,
                resultFormat: 'array'
            }).then((nonNullCounts) => {

                setFeatureNames(allFeatureNames.filter((_, i) => nonNullCounts[0][i] !== 0));
            });
        }).catch(errorStore.reportError);
    }, [model._id]);

    return (
        <div className='border border-1 p-3'>
            <Table>
                <thead>
                    <tr>
                        {FeatureIntegrityTableColumnConfigs.map((c, idx) => (<th className={`text-secondary py-2 ${idx === 0 ? 'w-25' : ''}`} colSpan={idx > 0 ? 1 : 2} key={c.name}>{c.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {featureNames.map((f) => <FeatureIntegrityRow key={f} name={f}/>)}
                </tbody>
            </Table>
        </div>
    );
};

FeatureIntegrityTable.propTypes = {
    errorStore: PropTypes.object,
    model: PropTypes.object
};

export default setupComponent(FeatureIntegrityTable);
