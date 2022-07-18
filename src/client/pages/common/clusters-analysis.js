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
        name: 'Image Embeddings',
        value: 'embeddings'
    }];

    if (modelType === 'UNSUPERVISED_OBJECT_DETECTION') {
        results.push({
            name: 'Prediction Box Embeddings',
            value: 'prediction.embeddings'
        });
    } else if (modelType === 'OBJECT_DETECTION') {
        results.push({
            name: 'Prediction Box Embeddings',
            value: 'prediction.embeddings'
        }, {
            name: 'Ground Truth Box Embeddings',
            value: 'groundtruth.embeddings'
        });
    }

    return results;
};

const _ClustersAnalysis = ({clusters}) => {
    const samplingLimit = 10000;
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const uniqueClusterLabels = new Set(selectedPoints.map((p) => p.clusterLabel));
    const sortedClusters = useMemo(() => clusters.map((c) => ({
        name: c.label === -1 ? 'noise' : c.label,
        size: c.elements.length,
        ...c,
        elements: c.elements.map((e) => ({clusterLabel: c.label, ...e}))
    })).sort((c1, c2) => c2.metric?.value - c1.metric?.value), [clusters]);
    const samples = selectedPoints.map((p) => p.sample);
    // SQL Filter for samples is sliced if there are more than samplingLimit samples.
    const samplesSqlFilter = `${allSqlFilters} AND uuid in (${
        samples.slice(0, samplingLimit).map((s) => `'${s['uuid']}'`).join(',')
    })`;
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

    useEffect(async () => {
        const result = await getDistributionMetricsForModel(mlModelType);

        setDistributionMetricsOptions(result);
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
                                refetchOnChanged={[samplesSqlFilter, samples, mlModelType]}
                                renderData={(data) => (
                                    <BarGraph
                                        className='border-0' height='50vh'
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
                </Col>
            ) : null}
        </Row>
        <Row className='g-2 mb-3'>
            <Col className='bg-white-blue rounded p-3'>
                <SamplesPreview samples={samples} onClearSamples={handleClearSamples}/>
            </Col>
        </Row>
        </>
    );
};

_ClustersAnalysis.propTypes = {
    clusters: PropTypes.array.isRequired
};

const ClustersAnalysis = ({sqlFilters, embeddingsField}) => {
    const allSqlFilters = sqlFilters || useAllSqlFilters();
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
                    <Select onChange={setUserSelectedEmbeddings}>
                        {getEmbeddingsFieldsForModel(model?.mlModelType).map((o, i) => (
                            <option key={i} value={o.value}>{o.name}</option>
                        ))}
                    </Select>
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
                            <AsyncSegmentationFields renderData={([data]) => (
                                <Select onChange={setUserSelectedGroupbyField} defaultValue=''>
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
                        onUserSelectedAlgorithm={setUserSelectedAlgorithm}
                        onUserSelectedMinClusterSize={setUserSelectedMinClusterSize}
                    />
                )}
            />
        </>
    );
};

ClustersAnalysis.propTypes = {
    sqlFilters: PropTypes.string,
    embeddingsField: PropTypes.string
};

export default ClustersAnalysis;
