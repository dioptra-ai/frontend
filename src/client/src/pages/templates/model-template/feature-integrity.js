import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import {FeatureIntegrityTableColumnNames, IconNames} from '../../../constants';
import {Area, Bar, BarChart, Cell, ComposedChart, Line, Tooltip} from 'recharts';
import {getRandomHexColor} from '../../../helpers/color-helper';
import FontIcon from '../../../components/font-icon';
import theme from '../../../styles/theme.module.scss';
import {setupComponent} from '../../../helpers/component-helper';

const FeatureIntegrityTableColumnConfigs = [
    {name: FeatureIntegrityTableColumnNames.FEATURE_NAME},
    {name: FeatureIntegrityTableColumnNames.INCIDENT_COUNT},
    {name: FeatureIntegrityTableColumnNames.TYPE},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION},
    {name: FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS},
    {name: FeatureIntegrityTableColumnNames.KS_TEST},
    {name: FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS}
];
const mockOnlineDistribution = [50, 40, 80, 30, 45, 70, 60, 35, 55, 35].map((a) => ({dist: a, color: getRandomHexColor(0.65)}));
const mockKSTest = [{x: '17:20', y: 0.4}, {x: '17:23', y: 0.46}, {x: '17:26', y: 0.7}, {x: '17:32', y: 0.32}, {x: '17:42', y: 0.42}];
const mockDateValues = ['Top 4 values', '05/10/2021: 2.1%', '05/24/2021: 1.9%', '05/25/2021: 1.7%', '05/01/2021: 0.8%'];
const mockDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra.';
const mockIntegrityFeatures = [
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'State', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'String',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['Top 4 values', 'NY: 16.7%', 'CA: 9.9%', 'FL: 5.3%', 'TX: 3.1%'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% Not in List', '% Type Violations', 'Coverage']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Transaction Date', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'Date',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: mockDateValues,
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% Not Within Range', 'Coverage']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Transaction Amount', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 1,
        [FeatureIntegrityTableColumnNames.TYPE]: 'Float',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['Min: $987.78', 'Max: $4,923.40', 'Mean: $1,241.83', 'St Dev: 26.98'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', '% Within Range', '% Type Violations', '% Outliers']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Card Insurance Date', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'Date',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: mockDateValues,
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Zip Code', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'String',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['Top 4 values', '10016: 0.56%', '94107: 0.43%', '33130: 0.24%', '33132: 0.12%'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Customer Credit Score', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'String',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['300 - 579: 16%', '580 - 669: 17%', '670 - 739: 21%', '740 - 799: 25%', '799 - 850: 21%'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Past Fraudulent Transaction', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 0,
        [FeatureIntegrityTableColumnNames.TYPE]: 'String',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['Min: 0', 'Max: 6', 'Mean: 1.3', 'St Dev: 0.98'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
    },
    {
        [FeatureIntegrityTableColumnNames.FEATURE_NAME]: {name: 'Merchant Category Code', description: mockDescription},
        [FeatureIntegrityTableColumnNames.INCIDENT_COUNT]: 1,
        [FeatureIntegrityTableColumnNames.TYPE]: 'String',
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION]: mockOnlineDistribution,
        [FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]: ['Top 4 values', '5684: 15%', '8902: 29.7%', '0058: 2.1%', '6001: 0.12%'],
        [FeatureIntegrityTableColumnNames.KS_TEST]: mockKSTest,
        [FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]: ['% NaN', '% Infinity', 'Coverage', '% Not Within Range', '% Type Violations', '% Outliers']
    }
]
    .map((row) => {
        const feature = row[FeatureIntegrityTableColumnNames.FEATURE_NAME];
        const featureName = feature.name;

        row.isKSTestValid = featureName !== 'Transaction Amount';
        row[FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS] = row[FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]
            .map((s) => {
                return {name: s, isHeading: s === 'Top 4 values'};
            });
        row[FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS] = row[FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]
            .map((q) => {
                return {name: q, isValid: featureName !== 'Merchant Category Code' || q !== '% Not Within Range'};
            });

        return row;
    });

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

const renderOnlineDistributionBarChart = (distributions) => {
    return (
        <div>
            <BarChart data={distributions} height={120} width={150}>
                <Bar background={false} dataKey='dist'>
                    {distributions.map((d, index) => (
                        <Cell accentHeight='0px' fill={d.color} key={`cell-${index}`}/>
                    ))}
                </Bar>
                <Tooltip content={<OnlineDistributionTooltip />} />
            </BarChart>
        </div>
    );
};

const renderIntegrityFeature = (f) => {
    const featureName = f[FeatureIntegrityTableColumnNames.FEATURE_NAME];
    const incidentCount = f[FeatureIntegrityTableColumnNames.INCIDENT_COUNT];
    const tdClasses = 'py-5 align-middle';

    return (
        <tr className='py-5' key={featureName.name}>
            <td className={tdClasses} colSpan={2}>
                <div className='fw-bold'>{featureName.name}</div>
                <div className='text-secondary'><small>{featureName.description}</small></div>
            </td>
            <td className={tdClasses}>
                <div className='d-flex align-items-center'>
                    {renderWarningCheckIcon(incidentCount === 0, 25)}
                    {incidentCount > 0 ? <span className='ms-1 text-warning'>{incidentCount}</span> : ''}
                </div>
            </td>
            <td className={tdClasses}>{f[FeatureIntegrityTableColumnNames.TYPE]}</td>
            <td className={tdClasses}> {renderOnlineDistributionBarChart(f[FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION])} </td>
            <td className={tdClasses}>
                {f[FeatureIntegrityTableColumnNames.ONLINE_DISTRIBUTION_STATS]
                    .map((s) => <div className={s.isHeading ? 'fw-bold' : ''} key={s.name}>{s.name}</div>)}
            </td>
            <td className={tdClasses}>{renderKSTestLineChart(f[FeatureIntegrityTableColumnNames.KS_TEST], f.isKSTestValid)}</td>
            <td className={tdClasses}>
                {f[FeatureIntegrityTableColumnNames.QUALITY_AND_OUTLIERS]
                    .map((s) => <div className='d-flex' key={s.name}>
                        {!s.isValid ? <div>{renderWarningCheckIcon(false, 15)}</div> : null }
                        <div>{s.name}</div>
                    </div>)}
            </td>
        </tr>
    );
};

const FeatureIntegrity = () => {
    return (
        <div className='border border-1 p-3'>
            <Table>
                <thead>
                    <tr>
                        {FeatureIntegrityTableColumnConfigs.map((c, idx) => (<th className={`text-secondary py-2 ${idx === 0 ? 'w-25' : ''}`} colSpan={idx > 0 ? 1 : 2} key={c.name}>{c.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {mockIntegrityFeatures.map((f) => renderIntegrityFeature(f))}
                </tbody>
            </Table>
        </div>
    );
};

FeatureIntegrity.propTypes = {
    model: PropTypes.object
};

export default setupComponent(FeatureIntegrity);
