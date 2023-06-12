import React from 'react';
import PropTypes from 'prop-types';
import {Bar, Cell} from 'recharts';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Select from 'components/select';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';

const Groups = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const [grouping, setGrouping] = React.useState('groundtruths');
    const filtersForAllModels = filters.concat(modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames.sort()
    } : []);
    const filtersForSelected = filters.concat(selectedDatapointIds.size ? {
        left: 'id',
        op: 'in',
        right: Array.from(selectedDatapointIds).sort()
    } : []);

    return (
        <div className='my-2'>
            <Async
                fetchData={() => baseJSONClient.post('/api/tags/select-distinct-names', {
                    datapointFilters: filtersForAllModels,
                    datasetId
                }, {memoized: true})}
                refetchOnChanged={[filtersForAllModels, datasetId]}
                renderData={(allTagNames) => (
                    <Select value={grouping} onChange={setGrouping} disabled={!datasetId}>
                        <option value='groundtruths'>Groundtruths</option>
                        {
                            modelNames.length ? (
                                <>
                                    <option value='predictions'>Predictions</option>
                                    <option value='entropy'>Entropy</option>
                                    {/* <option value='mislabeling'>Mislabeling Score</option> */}
                                </>
                            ) : null
                        }
                        {allTagNames.map((tagName) => (
                            <option key={`tag/${tagName}`} value={`tag/${tagName}`}>
                                tags.name = {tagName}
                            </option>
                        ))}
                    </Select>
                )}
            />
            <div className='my-2'>
                <Async
                    fetchData={() => Promise.all([
                    // First element = distributions for all datapoints
                        Promise.all((modelNames.length ? modelNames : [undefined]).map((modelName) => baseJSONClient.post(`/api/analytics/distribution/${grouping}`, {
                            filters, modelName, datasetId
                        }, {memoized: true}))),
                        // Second element = distributions for selected datapoints
                        Promise.all((modelNames.length ? modelNames : [undefined]).map((modelName) => baseJSONClient.post(`/api/analytics/distribution/${grouping}`, {
                            filters: filtersForSelected,
                            modelName, datasetId
                        }, {memoized: true})))
                    ])}
                    refetchOnChanged={[filters, filtersForSelected, datasetId, grouping, JSON.stringify(modelNames)]}
                    renderData={([allDistributions, selectedDistributions]) => {
                        // Dedupe buckets and maintain ordering.
                        const bars = allDistributions.flatMap(({histogram}) => Object.keys(histogram).map((name) => ({
                            name,
                            index: histogram[name].index,
                            selectedValues: selectedDistributions.map(({histogram}) => histogram[name]),
                            allValues: allDistributions.map(({histogram}) => histogram[name])
                        })).sort((a, b) => a.index - b.index));

                        return (
                            <BarGraph
                                title={allDistributions[0]?.title}
                                bars={bars}
                                sortBy='index'
                                renderTooltip={({active, payload, label}) => {

                                    return (active && payload?.length) ? (
                                        <div className='bg-white border rounded p-2'>
                                            <div className='bold-text fs-4'>{label}</div>
                                            <div className='fs-6'>
                                                {
                                                    // First half of the values are for selected datapoints.
                                                    payload.slice(0, payload.length / 2).map(({name, value}, i) => {
                                                        const totalValue = payload[payload.length / 2 + i].value + value;

                                                        return (
                                                            <div key={name} className='d-flex align-items-center'>
                                                                <div className='me-2' style={{width: 10, height: 10, backgroundColor: getHexColor(modelNames[i])}}/>
                                                                <div className='me-2'>{name}</div>
                                                                <div className='me-2'>{value.toLocaleString()}</div>
                                                                <div className='me-2'>{(value / totalValue).toLocaleString(undefined, {style: 'percent'})}</div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    ) : null;
                                }}
                            >
                                {(modelNames.length ? modelNames : [undefined]).map((modelName, i) => (
                                    <Bar key={`selected:${modelName}`} className='cursor-pointer'
                                        dataKey={({selectedValues}) => {
                                            return (selectedValues[i]?.['value'] || 0);
                                        }}
                                        stackId={String(modelName)}
                                        onClick={({selectedValues}) => {
                                            onSelectedDatapointIdsChange(new Set(selectedValues[i]?.['datapoints'] || []));
                                        }}
                                    >
                                        {
                                            bars.map(({name, index}) => {
                                                const fill = index === undefined ? getHexColor(name) : getHexColor(modelName, Math.max(0.1, index / bars.length));

                                                return (
                                                    <Cell key={name} fill={fill}/>
                                                );
                                            })
                                        }
                                    </Bar>
                                ))}
                                {(modelNames.length ? modelNames : [undefined]).map((modelName, i) => (
                                    <Bar key={`all:${modelName}`} className='cursor-pointer'
                                        dataKey={({allValues, selectedValues}) => {
                                            return (allValues[i]?.['value'] || 0) - (selectedValues[i]?.['value'] || 0);
                                        }}
                                        stackId={String(modelName)}
                                        fill='#999'
                                        onClick={({allValues}) => {
                                            onSelectedDatapointIdsChange(new Set(allValues[i]?.['datapoints'] || []));
                                        }}
                                    />
                                ))}
                            </BarGraph>
                        );
                    }}
                />
            </div>
        </div>
    );
};

Groups.propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasetId: PropTypes.string,
    modelNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedDatapointIds: PropTypes.object.isRequired,
    onSelectedDatapointIdsChange: PropTypes.func.isRequired
};

export default Groups;
