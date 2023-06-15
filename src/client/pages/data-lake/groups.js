import React from 'react';
import PropTypes from 'prop-types';
import {Bar, Cell} from 'recharts';

import baseJSONClient from 'clients/base-json-client';
import Async from 'components/async';
import Select from 'components/select';
import BarGraph from 'components/bar-graph';
import {getHexColor} from 'helpers/color-helper';

const getColorScaleDesc = (grouping) => new Set(['entropy', 'mislabeling', 'hallucination_score']).has(grouping);

const Groups = ({filters, datasetId, modelNames, selectedDatapointIds, onSelectedDatapointIdsChange}) => {
    const [grouping, setGrouping] = React.useState('groundtruths');
    const filtersForAllModels = filters.concat(modelNames.length ? {
        left: 'predictions.model_name',
        op: 'in',
        right: modelNames.sort()
    } : []);
    const isGroupColorDesc = getColorScaleDesc(grouping);

    return (
        <div className='my-2'>
            <Async
                fetchData={() => Promise.all([
                    baseJSONClient.post('/api/tags/select-distinct-names', {
                        datapointFilters: filtersForAllModels,
                        datasetId
                    }, {memoized: true}),
                    baseJSONClient.post('/api/predictions/select-distinct-metrics', {
                        datapointFilters: filtersForAllModels,
                        datasetId
                    }, {memoized: true})
                ])}
                refetchOnChanged={[filtersForAllModels, datasetId]}
                renderData={([allTagNames, allMetricNames]) => (
                    <Select value={grouping} onChange={setGrouping} disabled={!datasetId}>
                        <option value='groundtruths'>Groundtruths</option>
                        {modelNames.length ? (
                            <>
                                <option value='predictions'>Predictions</option>
                                <option value='entropy'>Entropy</option>
                                {/* <option value='mislabeling'>Mislabeling Score</option> */}
                            </>
                        ) : null}
                        {allMetricNames.map((metricName) => (
                            <option key={metricName} value={metricName}>
                                {metricName}
                            </option>
                        ))}
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
                    fetchData={() => Promise.all((modelNames.length ? modelNames : [undefined]).map((modelName) => baseJSONClient.post(`/api/analytics/distribution/${grouping}`, {
                        filters, modelName, datasetId
                    }, {memoized: true})))}
                    refetchOnChanged={[filters, grouping, datasetId, modelNames]}
                    renderData={(allDistributions) => {
                        // Dedupe buckets and maintain ordering.
                        const bucketNames = new Set(allDistributions.flatMap(({histogram}) => Object.keys(histogram)));
                        const buckets = Array.from(bucketNames).map((name) => ({
                            name,
                            index: allDistributions.find(({histogram}) => histogram[name]?.index !== undefined)?.histogram[name].index,
                            bars: allDistributions.map(({histogram}) => histogram[name])
                        })).sort((a, b) => a.index - b.index);

                        return (
                            <BarGraph
                                title={allDistributions[0]?.title}
                                bars={buckets}
                                sortBy='index'
                                renderTooltip={({active, payload, label}) => {

                                    return active ? (
                                        <div className='bg-white border rounded p-2'>
                                            <div className='bold-text fs-4'>{label}</div>
                                            <div className='fs-6'>
                                                {
                                                    // selected / unselected bars alternate in payload.
                                                    payload?.length ? Array(payload.length / 2).fill().map((_, i) => {
                                                        const selected = payload[2 * i];
                                                        const unselected = payload[2 * i + 1];

                                                        return (
                                                            <div key={modelNames[i]} className='d-flex align-items-center'>
                                                                <div className='me-2' style={{width: 10, height: 10, backgroundColor: getHexColor(modelNames[i])}}/>
                                                                <div className='me-2'>{modelNames[i]}</div>
                                                                <div className='me-2'>{selected.value.toLocaleString()}</div>
                                                                <div className='me-2'>{(selected.value / (selected.value + unselected.value)).toLocaleString(undefined, {style: 'percent'})}</div>
                                                            </div>
                                                        );
                                                    }) : null
                                                }
                                            </div>
                                        </div>
                                    ) : null;
                                }}
                            >
                                {(modelNames.length ? modelNames : [undefined]).map((modelName, i) => (
                                    <>
                                        <Bar key={`selected:${modelName}`} className='cursor-pointer'
                                            dataKey={({bars}) => {

                                                return bars[i]?.['datapoints'].filter((id) => !selectedDatapointIds.size || selectedDatapointIds.has(id)).length || 0;
                                            }}
                                            stackId={String(modelName)}
                                            onClick={({bars}, _, e) => {

                                                if (!e.shiftKey) { // If shift, don't change selection since this is additive.
                                                    onSelectedDatapointIdsChange(new Set((bars[i]?.['datapoints'].filter((id) => !selectedDatapointIds.size || selectedDatapointIds.has(id))) || []));
                                                }
                                            }}
                                        >
                                            {
                                                buckets.map(({name, index}) => {
                                                    const fill = index === undefined ? getHexColor(name) : isGroupColorDesc ? `hsla(${100 * (1 - index / buckets.length)}, 100%, 50%, 1)` : `hsla(${100 * index / buckets.length}, 100%, 50%, 1)`;

                                                    return (
                                                        <Cell key={name} fill={fill}/>
                                                    );
                                                })
                                            }
                                        </Bar>
                                        <Bar key={`unselected:${modelName}`} className='cursor-pointer'
                                            dataKey={({bars}) => {

                                                return (bars[i]?.['datapoints']?.filter((id) => selectedDatapointIds.size && !selectedDatapointIds.has(id)) || []).length || 0;
                                            }}
                                            stackId={String(modelName)}
                                            fill='#999'
                                            onClick={({bars}, _, e) => {
                                                const newSelectedDatapointIds = new Set(bars[i]?.['datapoints']);

                                                if (e.shiftKey) {
                                                    onSelectedDatapointIdsChange(new Set([...selectedDatapointIds, ...newSelectedDatapointIds]));
                                                } else {
                                                    onSelectedDatapointIdsChange(newSelectedDatapointIds);
                                                }
                                            }}
                                        />
                                    </>
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
