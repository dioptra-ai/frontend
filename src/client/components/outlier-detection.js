import React, {useState} from 'react';
import {Area, CartesianGrid, ComposedChart, ResponsiveContainer, Scatter, XAxis, YAxis, ZAxis} from 'recharts';
import Legend from './graph-legend';
import Table from './table';
import Select from './select';
import {OutlierDetectionOptions} from '../enums/outlier-detection-options';
import theme from '../styles/theme.module.scss';
import fontSizes from '../styles/font-sizes.module.scss';

const data = [
    {
        date: '08/19',
        area_1: [24, 61],
        area_2: [10, 78]
    },
    {
        date: '08/21',
        area_1: [22, 59],
        area_2: [11, 75]
    },
    {
        date: '08/23',
        y: 87,
        z: 300,
        area_1: [23, 60],
        area_2: [10, 77]
    },
    {
        date: '08/25',
        area_1: [21, 62],
        area_2: [11, 81]
    },
    {
        date: '08/27',
        y: 95,
        z: 300,
        area_1: [22, 60],
        area_2: [12, 84]
    },
    {
        date: '08/29',
        area_1: [20, 60],
        area_2: [10, 82]
    },
    {
        date: '08/31',
        area_1: [21, 61],
        area_2: [10, 80]
    },
    {
        date: '09/02',
        area_1: [22, 63],
        area_2: [11, 79]
    },
    {
        date: '09/04',
        y: 82,
        z: 300,
        area_1: [20, 60],
        area_2: [10, 83]
    },
    {
        date: '09/06',
        area_1: [19, 57],
        area_2: [11, 80]
    },
    {
        date: '09/08',
        area_1: [20, 59],
        area_2: [10, 81]
    },
    {
        date: '09/10',
        area_1: [21, 61],
        area_2: [11, 82]
    },
    {
        date: '09/12',
        area_1: [21, 62],
        area_2: [12, 83]
    },
    {
        date: '09/14',
        area_1: [20, 60],
        area_2: [11, 80]
    }
];

const tableColumns = [
    {
        Header: 'Outlier',
        accessor: 'outlierPercentage'
    },
    {
        Header: 'Outlier Date',
        accessor: 'outlierDate'
    },
    {
        Header: 'Prediction Class',
        accessor: 'predictionClass'
    },
    {
        Header: 'State',
        accessor: 'state'
    },
    {
        Header: 'Transaction Date',
        accessor: 'transactionDate'
    },
    {
        Header: 'Transaction Amount',
        accessor: 'transactionAmount'
    },
    {
        Header: 'Card Issuance Date',
        accessor: 'cardIssuanceDate'
    },
    {
        Header: 'Zip Code',
        accessor: 'zipCode'
    },
    {
        Header: 'Customer Credit Score',
        accessor: 'customerCreditScore'
    },
    {
        Header: 'Past Fraudulent Transaction',
        accessor: 'pastFraudulentTransaction'
    },
    {
        Header: 'Merchant Category Code',
        accessor: 'merchantCategoryCode'
    }
];

const tableData = [
    {
        outlierPercentage: '85%',
        outlierDate: '08/23',
        predictionClass: 'Non fraudulent',
        state: 'NY',
        transactionDate: '05/05/2021',
        transactionAmount: '$0 - $100',
        cardIssuanceDate: '05/05/2019',
        zipCode: '10002',
        customerCreditScore: '100',
        pastFraudulentTransaction: '1005',
        merchantCategoryCode: '350'
    },
    {
        outlierPercentage: '90%',
        outlierDate: '08/27',
        predictionClass: 'Non fraudulent',
        state: 'CA',
        transactionDate: '05/21/2021',
        transactionAmount: '$100 - $1,000',
        cardIssuanceDate: '05/21/2020',
        zipCode: '90650',
        customerCreditScore: '99',
        pastFraudulentTransaction: '9065',
        merchantCategoryCode: '686'
    },
    {
        outlierPercentage: '82%',
        outlierDate: '09/04',
        predictionClass: 'Fraudulent transaction',
        state: 'NC',
        transactionDate: '05/28/2021',
        transactionAmount: '$1,000 - $10,000',
        cardIssuanceDate: '01/28/2021',
        zipCode: '27006',
        customerCreditScore: '58',
        pastFraudulentTransaction: '7006',
        merchantCategoryCode: '850'
    }
];

const OutlierDetection = () => {
    const [selectedOption, setSelectedOption] = useState(OutlierDetectionOptions.EXPORT.value);


    return (
        <div className='my-5'>
            <h3 className='text-dark bold-text fs-3 mb-3'>Outlier detection</h3>
            <div className='border rounded p-3' >
                <div style={{height: '350px'}}>
                    <ResponsiveContainer height='100%' width='100%'>
                        <ComposedChart
                            data={data}
                            margin={{
                                top: 30,
                                bottom: 30,
                                left: 10
                            }}
                        >
                            <CartesianGrid strokeDasharray='5 5' />
                            <XAxis
                                dataKey='date'
                                dy={5}
                                label={{fill: theme.dark, value: 'Date', dy: 30, fontSize: fontSizes.fs_7}}
                                stroke='transparent'
                                tick={{fill: theme.secondary, fontSize: fontSizes.fs_7}}
                            />
                            <YAxis
                                dataKey='y'
                                domain={[0, 100]} dx={-5}
                                label={{fill: theme.dark, value: 'Majority Class Confidence', angle: -90, dx: -30, fontSize: fontSizes.fs_7}}
                                stroke='transparent'
                                tick={{fill: theme.secondary, fontSize: fontSizes.fs_7}}
                                tickCount={6}
                                unit='%'
                            />
                            <ZAxis
                                dataKey='z'
                                range={[0, 400]}
                                type='number'
                            />
                            <Area dataKey='area_1' fill={theme.primary} fillOpacity='.3' stroke='none' type='monotone' />
                            <Area dataKey='area_2' fill={theme.primary} fillOpacity='.15' stroke='none' type='monotone' />
                            <Scatter data={data} fill={theme.warning}/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <Legend
                    data={[
                        {name: 'Confidence of Class 25% - 75%', fill: theme.primary, fillOpacity: '.3'},
                        {name: 'Confidence of Class 10% - 90%', fill: theme.primary, fillOpacity: '.15'}
                    ]}
                />
                <div className='d-flex justify-content-end my-3' >
                    <div style={{width: '200px'}}>
                        <Select initialValue={selectedOption} onChange={setSelectedOption} options={Object.values(OutlierDetectionOptions)}/>
                    </div>
                </div>
                <Table
                    columns={tableColumns}
                    data={tableData}
                />
            </div>

        </div>
    );
};

export default OutlierDetection;