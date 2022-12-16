import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {saveAs} from 'file-saver';

import Select from 'components/select';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import AsyncSegmentationFields from 'components/async-segmentation-fields';
import ScatterChart, {ScatterSearch} from 'components/scatter-chart';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';
import Form from 'react-bootstrap/Form';
import SamplesPreview from 'components/samples-preview';
import useAllFilters from 'hooks/use-all-filters';

// Keep this in sync with metrics-engine/handlers/clusters.py
const MODEL_TYPE_TO_METRICS_NAMES = {
    'Q_N_A': ['COUNT', 'EXACT_MATCH', 'F1_SCORE'],
    'AUTO_COMPLETION': ['COUNT', 'EXACT_MATCH', 'F1_SCORE'],
    'SPEECH_TO_TEXT': ['COUNT', 'EXACT_MATCH', 'WORD_ERROR_RATE'],
    'TEXT_CLASSIFIER': ['COUNT', 'ACCURACY', 'F1_SCORE', 'PRECISION', 'RECALL'],
    'UNSUPERVISED_OBJECT_DETECTION': ['COUNT', 'CONFIDENCE', 'ENTROPY'],
    'OBJECT_DETECTION': ['COUNT', 'MEAN_AVERAGE_PRECISION', 'MEAN_AVERAGE_RECALL'],
    'IMAGE_CLASSIFIER': ['COUNT', 'ACCURACY', 'PRECISION', 'F1_SCORE', 'RECALL'],
    'UNSUPERVISED_IMAGE_CLASSIFIER': ['COUNT', 'CONFIDENCE', 'ENTROPY'],
    'UNSUPERVISED_TEXT_CLASSIFIER': ['COUNT', 'CONFIDENCE', 'ENTROPY'],
    'SEMANTIC_SIMILARITY': ['COUNT', 'PEARSON_CONSINE', 'SPEARMAN_COSINE'],
    'NER': ['COUNT', 'ACCURACY', 'F1_SCORE', 'PRECISION', 'RECALL'],
    'LEARNING_TO_RANK': ['COUNT', 'MEAN_NDCG', 'MRR']
};
const getDistributionFieldForModel = (modelType) => {
    if (modelType.startsWith('UNSUPERVISED_')) {

        return [{
            name: 'Prediction',
            value: '"prediction"->\'class_name\''
        }];
    } else if (modelType.startsWith('LEARNING_TO_RANK')) {

        return [{
            name: 'Relevance',
            value: '"groundtruth"->\'relevance\''
        }, {
            name: 'Prediction Score',
            value: '"prediction"->\'score\''
        }];
    } else {

        return [{
            name: 'Prediction',
            value: '"prediction"->\'class_name\''
        }, {
            name: 'Ground truth',
            value: '"groundtruth"->\'class_name\''
        }];
    }
};

const getEmbeddingsFieldsForModel = (modelType) => {

    if (modelType === 'UNSUPERVISED_OBJECT_DETECTION') {

        return [{
            name: 'Embeddings',
            value: 'embeddings'
        }, {
            name: 'Prediction Box Embeddings',
            value: 'prediction->\'embeddings\''
        }];
    } else if (modelType === 'OBJECT_DETECTION') {

        return [{
            name: 'Embeddings',
            value: 'embeddings'
        }, {
            name: 'Prediction Box Embeddings',
            value: 'prediction->\'embeddings\''
        }, {
            name: 'Ground Truth Box Embeddings',
            value: 'groundtruth.\'embeddings\''
        }];
    } else if (modelType === 'LEARNING_TO_RANK') {

        return [{
            name: 'Query Embeddings',
            value: 'embeddings'
        }, {
            name: 'Features',
            value: 'features'
        }];
    } else return [{
        name: 'Embeddings',
        value: 'embeddings'
    }];
};

const _ClustersAnalysis = ({clusters, clustersAreOfRequests}) => {
    const samplingLimit = 10000;
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const distributionMetricsOptions = getDistributionFieldForModel(mlModelType);
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState(distributionMetricsOptions[0].value);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const uniqueSampleRequestIds = new Set(selectedPoints.map(({sample}) => sample['request_id']));
    // Filters for fetching the class_names: if we have clusters of requests, fetch their corresponding matches
    // otherwise, fetch the class_names of the matches we already have.
    const matchFilter = clustersAreOfRequests ? {
        left: 'request_id',
        op: 'in',
        right: Array.from(uniqueSampleRequestIds)
    } : {
        left: 'uuid',
        op: 'in',
        right: Array.from(uniqueSampleUUIDs)
    };
    const uniqueClusterLabels = new Set(selectedPoints.map((p) => p.clusterLabel));
    const sortedClusters = useMemo(() => clusters.map((c) => ({
        name: c.label === -1 ? 'noise' : c.label,
        size: c.elements.length,
        ...c,
        elements: c.elements.map((e) => ({clusterLabel: c.label, ...e}))
    })).sort((c1, c2) => c2.metric?.value - c1.metric?.value), [clusters]);
    const allClusterElements = sortedClusters.map((cluster) => cluster.elements.map((e) => ({
        ...e,
        color: cluster.label === -1 ? getHexColor('') : getHexColor(cluster.label)
    }))).flat();
    const samples = selectedPoints.map((p) => p.sample);
    // SQL Filter for samples is sliced if there are more than samplingLimit samples.
    const samplesFilters = uniqueSampleUUIDs.size ? [{
        left: 'uuid',
        op: 'in',
        right: Array.from(uniqueSampleUUIDs).slice(0, samplingLimit)
    }] : null;
    const samplesCsvClassNames = Array.from(new Set(samples.map((s) => s['prediction'] || s['prediction.class_name']))).join(',');
    const handleClearSamples = (uuids) => {
        const uuidsSet = new Set(uuids);

        setSelectedPoints(selectedPoints.filter((p) => !uuidsSet.has(p.sample['uuid'])));
    };
    const handleSelectedDataChange = (points, e) => {
        if (points.length === 1) {
            const uuidToRemove = points[0]['sample']['uuid'];
            const point = selectedPoints.find(({sample}) => sample['uuid'] === uuidToRemove);

            if (point) {
                handleClearSamples([point.sample['uuid']]);

                return;
            }
        }

        const newSelectedPoints = e?.shiftKey ? selectedPoints.concat(points) : points;
        const uniquePointsByUUID = newSelectedPoints.reduce((agg, p) => ({
            ...agg,
            [p['sample']['uuid']]: p
        }), {});

        setSelectedPoints(Object.values(uniquePointsByUUID));
    };

    useEffect(() => {
        setSelectedPoints([]);
    }, [clusters]);

    return (
        <>{
            clusters.length >= 100 ? (
                <Alert variant='warning'>
                    This clustering analysis is only showing the first 100 clusters. Try filtering down and/or chosing different clustering parameters to see all values.
                </Alert>
            ) : null
        }
        {
            sortedClusters.some((c) => c.metric) ? (
                <Row>
                    <Col>
                        <BarGraph
                            className='border-0'
                            bars={sortedClusters.map((cluster) => {
                                const color = cluster.label === -1 ? getHexColor('') : getHexColor(cluster.label);

                                return ({
                                    name: cluster.name,
                                    value: cluster.metric?.value,
                                    fill: uniqueClusterLabels.size && !uniqueClusterLabels.has(cluster.label) ? d3.hsl(color).copy({l: 0.9}) : color,
                                    size: cluster.size
                                });
                            })}
                            onClick={(_, index, e) => {
                                handleSelectedDataChange(sortedClusters[index].elements, e);
                            }}
                            yAxisDomain={[0, 1]}
                        />
                    </Col>
                </Row>
            ) : null
        }
        <Row className='g-2 mb-3' style={{minHeight: '75vh'}}>
            <Col lg={8} className='d-flex flex-column'>
                <Row className='flex-grow-1'>
                    <Col>
                        <ScatterChart
                            data={allClusterElements}
                            getX={(p) => p['PCA1']}
                            getY={(p) => p['PCA2']}
                            getColor={(p) => {
                                if (uniqueSampleUUIDs.size && !uniqueSampleUUIDs.has(p.sample['uuid'])) {

                                    return d3.hsl(p.color).copy({l: 0.9});
                                } else {

                                    return p.color;
                                }
                            }}
                            onSelectedDataChange={handleSelectedDataChange}
                            isDatapointSelected={(p) => uniqueSampleUUIDs.has(p.sample['uuid'])}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ScatterSearch
                            data={allClusterElements}
                            onSelectedDataChange={handleSelectedDataChange}
                            isSearchMatch={(p, searchTerm) => JSON.stringify(p.sample).includes(searchTerm)}
                        />
                    </Col>
                </Row>
            </Col>
            {distributionMetricsOptions?.length ? (
                <Col lg={4} className='p-3 bg-white-blue rounded'>
                    <div className='text-dark bold-text d-flex align-items-center justify-content-between'>
                        <span>Summary ({samples.length} total)</span>
                        <div className='d-flex align-items-center'>
                            {samplesCsvClassNames ? (
                                <OverlayTrigger overlay={<Tooltip>Download classes as CSV</Tooltip>}>
                                    <IoDownloadOutline className='fs-2 cursor-pointer' onClick={() => {

                                        saveAs(new Blob([samplesCsvClassNames], {type: 'text/csv;charset=utf-8'}), 'classes.csv');
                                    }}/>
                                </OverlayTrigger>
                            ) : null}
                        </div>
                    </div>
                    <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                        {samples.length ? (
                            <Async
                                refetchOnChanged={[JSON.stringify(matchFilter), userSelectedSummaryDistribution]}
                                renderData={(data) => (
                                    <BarGraph
                                        className='border-0' height='50vh'
                                        bars={data.map(({label, value}) => ({
                                            name: label,
                                            value,
                                            fill: getHexColor(label)
                                        }))}
                                        title={(
                                            <Form.Control as='select' className='form-select w-100' custom required
                                                onChange={(e) => {
                                                    setUserSelectedSummaryDistribution(e.target.value);
                                                }}
                                                value={userSelectedSummaryDistribution}
                                            >
                                                {distributionMetricsOptions.map((o, i) => (
                                                    <option key={i} value={o.value}>{o.name} Distribution</option>
                                                ))}
                                            </Form.Control>
                                        )}
                                    />
                                )}
                                fetchData={() => metricsClient('queries/class-distribution', {
                                    filters: [matchFilter],
                                    distribution_field: userSelectedSummaryDistribution,
                                    bins: userSelectedSummaryDistribution === '"prediction"->\'score\'' ? 10 : null
                                })}
                            />
                        ) : (
                            <h3 className='text-secondary m-0'>No Examples Selected</h3>
                        )}
                    </div>
                </Col>
            ) : null}
        </Row>
        <Row className='g-2 mb-3'>
            <Col className='bg-white-blue rounded p-3'>
                <Async
                    fetchData={() => samplesFilters ? metricsClient('select', {
                        select: '"uuid", "groundtruth", prediction, "image_metadata", "text", "request_id", "tags"',
                        filters: samplesFilters,
                        limit: 1000
                    }) : null}
                    renderData={(datapoints) => <SamplesPreview samples={datapoints} limit={1000} />}
                    refetchOnChanged={[JSON.stringify(samplesFilters)]}
                />
            </Col>
        </Row>
        </>
    );
};

_ClustersAnalysis.propTypes = {
    clusters: PropTypes.array.isRequired,
    clustersAreOfRequests: PropTypes.bool.isRequired
};

const ClustersAnalysis = ({filters, embeddingsField}) => {
    const allFilters = filters || useAllFilters();
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[mlModelType];
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(metricNames?.[0]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');
    const [userSelectedDistanceName, setUserSelectedDistanceName] = useState('euclidean');
    const [userSelectedEmbeddings, setUserSelectedEmbeddings] = useState(embeddingsField || getEmbeddingsFieldsForModel(mlModelType)[0].value);
    const [userSelectedGroupbyField, setUserSelectedGroupbyField] = useState();
    const [userSelectedMinClusterSize, setUserSelectedMinClusterSize] = useState(undefined);

    return (
        <>
            <Row className='g-2 my-2'>
                {
                    metricNames ? (
                        <Col lg={2}>
                            Performance Metric
                            <Select onChange={setUserSelectedMetricName}>
                                {
                                    metricNames.map((m) => <option key={m}>{m}</option>)
                                }
                            </Select>
                        </Col>
                    ) : <Col lg={2}></Col>
                }
                <Col/>
                <Col lg={2}>
                    Analysis Space
                    {
                        embeddingsField ? (
                            <Select disabled>
                                <option>{embeddingsField}</option>
                            </Select>
                        ) : (
                            <Select onChange={setUserSelectedEmbeddings}>
                                {getEmbeddingsFieldsForModel(model?.mlModelType).map((o, i) => (
                                    <option key={i} value={o.value}>{o.name}</option>
                                ))}
                            </Select>
                        )
                    }
                </Col>
                <Col lg={2}>
                    Cluster Grouping
                    <Select onChange={setUserSelectedAlgorithm}>
                        <option value='GROUPBY'>Metadata</option>
                        <option value='HDBSCAN'>HDBSCAN</option>
                    </Select>
                </Col>
                {
                    userSelectedAlgorithm === 'HDBSCAN' ? (
                        <>
                            <Col lg={2}>
                            Distance Metric
                                <Select
                                    options={[{
                                        name: 'Euclidean',
                                        value: 'euclidean'
                                    }, {
                                        name: 'Cosine',
                                        value: 'cosine'
                                    }]}
                                    onChange={setUserSelectedDistanceName}
                                />
                            </Col>
                            <Col lg={2}>
                                Min. Cluster Size
                                <Form.Control
                                    type='number' placeholder='Default: auto'
                                    min={2} step={1}
                                    onBlur={(e) => setUserSelectedMinClusterSize(Number(e.target.value))}
                                />
                            </Col>
                        </>
                    ) : userSelectedAlgorithm === 'GROUPBY' ? (
                        <Col lg={4}>
                            Group By Field
                            <AsyncSegmentationFields renderData={(fields) => (
                                <Select onChange={setUserSelectedGroupbyField} defaultValue=''>
                                    <option value=''>No Field Selected</option>
                                    {
                                        fields.map((f) => (
                                            <option key={f} value={f}>{f}</option>
                                        ))
                                    }
                                </Select>
                            )}/>
                        </Col>
                    ) : null
                }
            </Row>
            <Async
                refetchOnChanged={[
                    allFilters,
                    userSelectedDistanceName,
                    userSelectedMetricName,
                    userSelectedAlgorithm,
                    userSelectedEmbeddings,
                    userSelectedGroupbyField,
                    userSelectedMinClusterSize
                ]}
                fetchData={() => metricsClient('clusters', {
                    model_type: model?.mlModelType,
                    filters: allFilters,
                    distance: userSelectedDistanceName,
                    metric: userSelectedMetricName,
                    clustering_algorithm: userSelectedAlgorithm,
                    groupby_field: userSelectedGroupbyField,
                    embeddings_field: userSelectedEmbeddings,
                    min_cluster_size: userSelectedMinClusterSize > 1 ? userSelectedMinClusterSize : undefined
                })}
                renderData={(clusters = []) => (
                    <_ClustersAnalysis
                        clusters={clusters}
                        clustersAreOfRequests={['embeddings', 'features'].includes(userSelectedEmbeddings)}
                    />
                )}
            />
        </>
    );
};

ClustersAnalysis.propTypes = {
    embeddingsField: PropTypes.string,
    filters: PropTypes.func
};

export default ClustersAnalysis;
