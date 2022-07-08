import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {saveAs} from 'file-saver';
import {useDebounce} from '@react-hook/debounce';

import Select from 'components/select';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import AsyncSegmentationFields from 'components/async-segmentation-fields';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterChart, {ScatterSearch} from 'components/scatter-chart';
import metricsClient from 'clients/metrics';
import useModel from 'hooks/use-model';
import Form from 'react-bootstrap/Form';
import SamplesPreview from 'components/samples-preview';

// Keep this in sync with metrics-engine/handlers/clusters.py
const MODEL_TYPE_TO_METRICS_NAMES = {
    'Q_N_A': ['EXACT_MATCH', 'F1_SCORE'],
    'AUTO_COMPLETION': ['EXACT_MATCH', 'F1_SCORE'],
    'SPEECH_TO_TEXT': ['EXACT_MATCH', 'WORD_ERROR_RATE'],
    'TEXT_CLASSIFIER': ['ACCURACY', 'F1_SCORE', 'PRECISION', 'RECALL'],
    'UNSUPERVISED_OBJECT_DETECTION': ['CONFIDENCE', 'ENTROPY'],
    'OBJECT_DETECTION': ['MEAN_AVERAGE_PRECISION', 'MEAN_AVERAGE_RECALL'],
    'IMAGE_CLASSIFIER': ['ACCURACY', 'PRECISION', 'F1_SCORE', 'RECALL'],
    'UNSUPERVISED_IMAGE_CLASSIFIER': ['CONFIDENCE', 'ENTROPY'],
    'UNSUPERVISED_TEXT_CLASSIFIER': ['CONFIDENCE', 'ENTROPY'],
    'SEMANTIC_SIMILARITY': ['PEARSON_CONSINE', 'SPEARMAN_COSINE']
};
const getDistributionMetricsForModel = (modelType) => {
    if (modelType === 'IMAGE_CLASSIFIER' || modelType === 'TEXT_CLASSIFIER') {
        return [{
            name: 'prediction',
            value: 'prediction'
        }, {
            name: 'groundtruth',
            value: 'groundtruth'
        }];
    } else if (modelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || modelType === 'UNSUPERVISED_TEXT_CLASSIFIER') {
        return [{
            name: 'prediction',
            value: 'prediction'
        }];
    } else if (modelType === 'OBJECT_DETECTION') {
        return [{
            name: 'prediction.class_name',
            value: 'prediction.class_name'
        }, {
            name: 'groundtruth.class_name',
            value: 'groundtruth.class_name'
        }];
    } else if (modelType === 'UNSUPERVISED_OBJECT_DETECTION') {
        return [{
            name: 'prediction.class_name',
            value: 'prediction.class_name'
        }];
    } else {
        return [];
    }
};

const getEmbeddingsFieldsForModel = (modelType) => {
    const results = [{
        name: 'image embeddings',
        value: 'embeddings'
    }];

    if (modelType === 'UNSUPERVISED_OBJECT_DETECTION') {
        results.push({
            name: 'prediction box embeddings',
            value: 'prediction.embeddings'
        });
    }
    if (modelType === 'OBJECT_DETECTION') {
        results.push({
            name: 'prediction box embeddings',
            value: 'prediction.embeddings'
        });
        results.push({
            name: 'groundtruth box embeddings',
            value: 'groundtruth.embeddings'
        });
    }

    return results;
};

const _ClustersAnalysis = ({clusters, onUserSelectedMetricName, onUserSelectedDistanceName, onUserSelectedEmbeddings, onUserSelectedAlgorithm, onUserSelectedGroupbyField, onUserSelectedMinClusterSize}) => {
    const samplingLimit = 10000;
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[mlModelType];
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [embeddingsFieldOptions, setEmbeddingsFieldOptions] = useState([]);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');
    const [userSelectedMinClusterSize, setUserSelectedMinClusterSize] = useState('GROUPBY');
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const sortedClusters = useMemo(() => clusters.map((c) => ({
        name: c.label === -1 ? 'noise' : c.label,
        size: c.elements.length,
        ...c
    })).sort((c1, c2) => c2.metric?.value - c1.metric?.value), [clusters]);
    const samples = selectedPoints.map((p) => p.sample);
    // SQL Filter for samples is sliced if there are more than samplingLimit samples.
    const samplesSqlFilter = `${allSqlFilters} AND request_id in (${
        samples.slice(0, samplingLimit).map((s) => `'${s['request_id']}'`).join(',')
    })`;
    const samplesCsvClassNames = Array.from(new Set(samples.map((s) => s['prediction'] || s['prediction.class_name']))).join(',');
    const handleUserSelectedAlgorithm = (value) => {
        setUserSelectedAlgorithm(value);
        onUserSelectedAlgorithm(value);
    };
    const handleUserSelectedMinClusterSize = (e) => {
        setUserSelectedMinClusterSize(Number(e.target.value));
        onUserSelectedMinClusterSize(Number(e.target.value));
    };
    const handleClearSample = (i) => {
        setSelectedPoints(selectedPoints.filter((_, index) => index !== i));
    };
    const handleSelectedDataChange = (points, e) => {
        if (points.length === 1) {
            const uuidToRemove = points[0]['sample']['uuid'];
            const pointIndex = selectedPoints.findIndex(({sample}) => sample['uuid'] === uuidToRemove);

            if (pointIndex > -1) {
                handleClearSample(pointIndex);

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

    useEffect(async () => {
        const result = await getDistributionMetricsForModel(mlModelType);

        setDistributionMetricsOptions(result);
    }, [mlModelType]);

    useEffect(async () => {
        const result = await getEmbeddingsFieldsForModel(mlModelType);

        setEmbeddingsFieldOptions(result);
    }, [mlModelType]);

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
        <Row className='g-2 my-3'>
            <Col lg={2}>
                Embeddings vectors
                <Select onChange={onUserSelectedEmbeddings}>
                    {embeddingsFieldOptions.map((o, i) => (
                        <option key={i} value={o.value}>{o.name}</option>
                    ))}
                </Select>
            </Col>
            {
                metricNames ? (
                    <Col lg={2}>
                        Performance Metric
                        <Select onChange={onUserSelectedMetricName}>
                            {
                                metricNames.map((m) => <option key={m}>{m}</option>)
                            }
                        </Select>
                    </Col>
                ) : null
            }
            <Col/>
            <Col lg={2}>
                Cluster Grouping
                <Select onChange={handleUserSelectedAlgorithm}>
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
                                onChange={onUserSelectedDistanceName}
                            />
                        </Col>
                        <Col lg={2}>
                            Min. Cluster Size
                            <Form.Control type='number' min={2} step={1} value={userSelectedMinClusterSize} onChange={handleUserSelectedMinClusterSize}/>
                        </Col>
                    </>
                ) : userSelectedAlgorithm === 'GROUPBY' ? (
                    <Col lg={4}>
                        Group By Field
                        <AsyncSegmentationFields renderData={([data]) => (
                            <Select onChange={onUserSelectedGroupbyField} defaultValue=''>
                                <option value=''>No Field Selected</option>
                                {
                                    Object.keys(data).filter((k) => data[k] > 0).map((k) => (
                                        <option key={k} value={k}>{k}</option>
                                    ))
                                }
                            </Select>
                        )}/>
                    </Col>
                ) : null
            }
        </Row>
        {
            sortedClusters.some((c) => c.metric) ? (
                <Row className='my-3'>
                    <Col>
                        <BarGraph
                            bars={sortedClusters.map((cluster) => ({
                                name: cluster.name,
                                value: cluster.metric?.value,
                                fill: cluster.label === -1 ? getHexColor('') : getHexColor(cluster.label),
                                size: cluster.size
                            }))}
                            onClick={(_, index, e) => {
                                handleSelectedDataChange(sortedClusters[index].elements, e);
                            }}
                            yAxisDomain={[0, 1]}
                        />
                    </Col>
                </Row>
            ) : null
        }
        <Row className='g-2 my-3'>
            <Col lg={8} className='d-flex flex-column'>
                <Row className='flex-grow-1'>
                    <Col>
                        <ScatterChart
                            data={sortedClusters.map((cluster) => cluster.elements.map((e) => ({
                                ...e,
                                color: cluster.label === -1 ? getHexColor('') : getHexColor(cluster.label)
                            }))).flat()}
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
                            isSearchMatch={(p, searchTerm) => Object.values(p.sample).some((v) => v?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ScatterSearch
                            data={sortedClusters.map((c) => c.elements).flat()} onSelectedDataChange={handleSelectedDataChange}
                            isSearchMatch={(p, searchTerm) => Object.values(p.sample).some((v) => v?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))}
                        />
                    </Col>
                </Row>
            </Col>
            {distributionMetricsOptions?.length ? (
                <Col lg={4} className='px-3'>
                    <div className='bg-white-blue rounded p-3'>
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
                                    refetchOnChanged={[samplesSqlFilter, samples, mlModelType]}
                                    renderData={(data) => (
                                        <BarGraph
                                            bars={data.map(({name, value}) => ({
                                                name, value,
                                                fill: getHexColor(name)
                                            }))}
                                            title={(
                                                <Row className='g-2'>
                                                    <Col>Class Distribution</Col>
                                                    <Col>
                                                        <Form.Control as='select' className='form-select w-100' custom required
                                                            onChange={(e) => {
                                                                setUserSelectedSummaryDistribution(e.target.value);
                                                            }}
                                                        >
                                                            {distributionMetricsOptions.map((o, i) => (
                                                                <option key={i} value={o.value}>{o.name}</option>
                                                            ))}
                                                        </Form.Control>
                                                    </Col>
                                                </Row>
                                            )}
                                            unit='%'
                                        />
                                    )}
                                    fetchData={() => metricsClient(`queries/${(
                                        mlModelType === 'IMAGE_CLASSIFIER' ||
                                        mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || mlModelType === 'UNSUPERVISED_TEXT_CLASSIFIER' ||
                                        mlModelType === 'TEXT_CLASSIFIER' || mlModelType === 'SPEECH_TO_TEXT') ?
                                        'class-distribution-1' :
                                        'class-distribution-2'
                                    }`, {
                                        sql_filters: samplesSqlFilter,
                                        distribution_field: userSelectedSummaryDistribution
                                    })}
                                />
                            ) : (
                                <h3 className='text-secondary m-0'>No Examples Selected</h3>
                            )}
                        </div>
                    </div>
                </Col>
            ) : null}
        </Row>
        <Row>
            <Col className='px-3'>
                <div className='bg-white-blue rounded p-3'>
                    <SamplesPreview samples={samples} onClearSample={handleClearSample} onClearAllSamples={() => setSelectedPoints([])}/>
                </div>
            </Col>
        </Row>
        </>
    );
};

_ClustersAnalysis.propTypes = {
    clusters: PropTypes.array.isRequired,
    onUserSelectedMetricName: PropTypes.func.isRequired,
    onUserSelectedDistanceName: PropTypes.func.isRequired,
    onUserSelectedEmbeddings: PropTypes.func.isRequired,
    onUserSelectedAlgorithm: PropTypes.func.isRequired,
    onUserSelectedGroupbyField: PropTypes.func.isRequired,
    onUserSelectedMinClusterSize: PropTypes.func.isRequired
};

const ClustersAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[model?.mlModelType];
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(metricNames?.[0]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');
    const [userSelectedDistanceName, setUserSelectedDistanceName] = useState('euclidean');
    const [userSelectedEmbeddings, setUserSelectedEmbeddings] = useState('embeddings');
    const [userSelectedGroupbyField, setUserSelectedGroupbyField] = useState();
    const [userSelectedMinClusterSize, setUserSelectedMinClusterSize] = useDebounce(undefined, 500);

    return (
        <Async
            refetchOnChanged={[
                allSqlFilters,
                userSelectedDistanceName,
                userSelectedMetricName,
                userSelectedAlgorithm,
                userSelectedEmbeddings,
                userSelectedGroupbyField,
                userSelectedMinClusterSize
            ]}
            fetchData={() => metricsClient('clusters', {
                model_type: model?.mlModelType,
                sql_filters: allSqlFilters,
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
                    onUserSelectedMetricName={setUserSelectedMetricName}
                    onUserSelectedDistanceName={setUserSelectedDistanceName}
                    onUserSelectedAlgorithm={setUserSelectedAlgorithm}
                    onUserSelectedEmbeddings={setUserSelectedEmbeddings}
                    onUserSelectedGroupbyField={setUserSelectedGroupbyField}
                    onUserSelectedMinClusterSize={setUserSelectedMinClusterSize}
                />
            )}
        />
    );
};


export default ClustersAnalysis;
