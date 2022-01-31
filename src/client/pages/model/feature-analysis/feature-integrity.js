import {Bar, BarChart, Cell, Tooltip} from 'recharts';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import {useInView} from 'react-intersection-observer';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import {CustomTooltip, SmallChart} from 'components/area-graph';
import {IconNames} from 'constants';
import {getHexColor} from 'helpers/color-helper';
import FontIcon from 'components/font-icon';
import {setupComponent} from 'helpers/component-helper';
import metricsClient from 'clients/metrics';
import Async from 'components/async';
import useTimeGranularity from 'hooks/use-time-granularity';

const FeatureIntegrityTableColumnNames = {
    FEATURE_NAME: 'Feature Name',
    INCIDENT_COUNT: 'Incident Count',
    TYPE: 'Type',
    SHAP: 'SHAP',
    ONLINE_DISTRIBUTION: 'Online Distribution',
    ONLINE_DISTRIBUTION_STATS: 'Online Distribution Stats',
    DISTANCE: 'Offline / Online Distribution Distance',
    CORRELATION_TO_PREDICTION: 'Correlation to Prediction',
    QUALITY_AND_OUTLIERS: 'Quality & Outliers',
    ACTION: 'Action'
};
const FeatureIntegrityTableColumnConfigs = [
    {name: FeatureIntegrityTableColumnNames.FEATURE_NAME},
    {name: FeatureIntegrityTableColumnNames.INCIDENT_COUNT},
    {name: FeatureIntegrityTableColumnNames.TYPE},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS},
    {name: FeatureIntegrityTableColumnNames.DISTANCE},
    {name: FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS}
];
const renderWarningCheckIcon = (isOk, fontSize) => {
    const iconName = isOk ? IconNames.CHECK : IconNames.WARNING;
    const colorClass = `text-${isOk ? 'success' : 'warning'}`;

    return (
        <FontIcon className={colorClass} icon={iconName} size={fontSize} />
    );
};

const OnlineDistributionBarChart = ({distribution}) => {
    return distribution ? (
        <div>
            <BarChart data={distribution.sort((d1, d2) => d1.value - d2.value)} height={120} width={150}>
                <Bar background={false} dataKey='dist' minPointSize={2}>
                    {distribution.map((d, i) => (
                        <Cell accentHeight='0px' fill={d.color} key={i}/>
                    ))}
                </Bar>
                <Tooltip content={CustomTooltip} cursor={false} allowEscapeViewBox={{x: true, y: true}}/>
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
    const [featureCardinality, setFeatureCardinality] = useState(null);
    const [featureOnlineDistribution, setFeatureOnlineDistribution] = useState(null);
    const {ref, inView} = useInView();
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceRange: true});
    const maxTimeseriesTicks = 20;
    const timeGranularity = useTimeGranularity(maxTimeseriesTicks)?.toISOString();

    useEffect(() => {
        if (inView && !featureType) {
            metricsClient('queries/feature-type', {
                sql_filters: allSqlFilters,
                name
            })
                .then((values) => {

                    if (values.some((v) => isNaN(v[name]))) {
                        setFeatureType('String');
                    } else {
                        setFeatureType('Number');
                    }
                }).catch(console.error);
        }
    }, [inView, allSqlFilters]);

    useEffect(() => {

        if (inView && !featureCardinality) {
            metricsClient('queries/feature-cardinality', {
                sql_filters: allSqlFilters,
                name
            })
                .then((values) => {
                    setFeatureCardinality(values[0].count);
                }).catch(console.error);
        }
    }, [inView, allSqlFilters]);

    useEffect(() => {

        if (inView && featureCardinality) {

            if (featureType === 'String' || featureCardinality < 20) {
                metricsClient('queries/feature-online-distribution-2', {
                    sql_filters: allSqlFilters,
                    name
                })
                    .then((values) => {
                        setFeatureOnlineDistribution(values);
                    }).catch(console.error);
            } else if (featureType === 'Number') {
                metricsClient('queries/feature-online-distribution-1', {
                    sql_filters: allSqlFilters,
                    name
                })
                    .then((values) => {

                        setFeatureOnlineDistribution(values);
                    }).catch(console.error);
            }
        }
    }, [featureType, featureCardinality, inView, allSqlFilters]);

    return (
        <tr className='py-5' ref={ref}>
            <td className={tdClasses} colSpan={2}>
                <div className='bold-text'>{name}</div>
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
                    color: getHexColor(value, 0.65)
                }))}/>
            </td>
            <td className={tdClasses}>
                {['Top 4 values', '5684: 15%', '8902: 29.7%', '0058: 2.1%', '6001: 0.12%']
                    .map((s, i) => <div key={i}>{s.name}</div>)}
            </td>
            <td className={tdClasses}>
                {featureType && featureCardinality ? (
                    <Async
                        defaultData={[]}
                        renderData={(data) => (
                            <div style={{height: 150}}>
                                <SmallChart data={data} unit='%' />
                            </div>
                        )}
                        fetchData={() => metricsClient(`queries/${featureType === 'String' || featureCardinality < 4 ?
                            'feature-integrity-1' :
                            'feature-integrity-2'}`, {
                            name,
                            time_granularity: timeGranularity,
                            sql_filters: allSqlFilters,
                            offline_sql_filters: allOfflineSqlFilters
                        })}
                    />
                ) : null}
            </td>
            <td className={tdClasses}>
                {[
                    '% NaN',
                    '% Infinity',
                    'Coverage',
                    '% Not Within Range',
                    '% Type Violations',
                    '% Outliers'
                ].map((s, i) => (
                    <div className='d-flex' key={i}>
                        {s.name}
                    </div>
                ))}
            </td>
        </tr>
    );
};

FeatureIntegrityRow.propTypes = {
    name: PropTypes.string
};

const ObserverFeatureIntegrityRow = setupComponent(FeatureIntegrityRow);

const FeatureIntegrityTable = ({errorStore}) => {
    const [allFeatureNames, setAllFeatureNames] = useState(null);
    const [nonNullFeatureNames, setNonNullFeatureNames] = useState([]);
    const allSqlFilters = useAllSqlFilters();

    useEffect(() => {
        metricsClient('queries/all-features-names')
            .then((res) => {
                setAllFeatureNames(res.map((row) => row['COLUMN_NAME']));
            })
            .catch((e) => errorStore.reportError(e));
    }, []);

    useEffect(() => {

        if (allFeatureNames) {
            const featureNames = allFeatureNames.map((f) => `COUNT("${f}")`).join(', ');

            metricsClient('queries/non-null-feature-names', {
                sql_filters: allSqlFilters,
                all_feature_names: featureNames
            })
                .then(([nonNullCounts]) => {
                    setNonNullFeatureNames(allFeatureNames.filter((_, i) => nonNullCounts && nonNullCounts[i] !== 0));
                })
                .catch((e) => errorStore.reportError(e));
        }
    }, [allFeatureNames, allSqlFilters]);

    return (

        <div className='border border-1 px-3 pb-3 pt-2 rounded'>
            <Table>
                <thead className='fs-6'>
                    <tr className='border-0 border-bottom border-mercury'>
                        {FeatureIntegrityTableColumnConfigs.map((c, idx) => (<th className={`align-middle border-0 text-secondary pb-3 ${idx === 0 ? 'w-25' : ''} ${idx === 1 ? 'text-center' : ''}`} colSpan={idx > 0 ? 1 : 2} key={c.name}>{c.name}</th>))}
                    </tr>
                </thead>
                <tbody className='fs-6'>
                    {nonNullFeatureNames.map((f) => <ObserverFeatureIntegrityRow key={f} name={f}/>)}
                </tbody>
            </Table>
        </div>
    );
};

FeatureIntegrityTable.propTypes = {
    errorStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureIntegrityTable);
