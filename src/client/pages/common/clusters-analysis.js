import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter, Tooltip as ScatterTooltip} from 'recharts';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {saveAs} from 'file-saver';
import {SpinnerWrapper} from 'components/spinner';
import Select from 'components/select';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import AsyncSegmentationFields from 'components/async-segmentation-fields';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
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
    'UNSUPERVISED_OBJECT_DETECTION': ['MEAN_AVERAGE_PRECISION', 'MEAN_AVERAGE_RECALL'],
    'IMAGE_CLASSIFIER': ['ACCURACY', 'PRECISION', 'F1_SCORE', 'RECALL'],
    'UNSUPERVISED_IMAGE_CLASSIFIER': ['CONFIDENCE', 'ENTROPY'],
    'UNSUPERVISED_TEXT_CLASSIFIER': ['CONFIDENCE', 'ENTROPY'],
    'SEMANTIC_SIMILARITY': ['PEARSON_CONSINE', 'SPEARMAN_COSINE']
};

const _ClustersAnalysis = ({clusters, onUserSelectedMetricName, onUserSelectedDistanceName, onUserSelectedAlgorithm, onUserSelectedGroupbyField}) => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const {mlModelType} = model;
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[mlModelType];
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedClusterIndex, setSelectedClusterIndex] = useState();
    const [selectedPoints, setSelectedPoints] = useState(null);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');

    const getDistributionMetricsForModel = async (modelType) => {
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
        } else if (modelType === 'SPEECH_TO_TEXT') {
            const results = await metricsClient('queries/columns-names-for-audio');

            return results.map((p) => {
                return {
                    name: p.column,
                    value: p.column
                };
            });
        } else {
            return [];
        }
    };
    const sortedClusters = clusters.map((c) => ({
        name: c.label === -1 ? '[noise]' : `[${c.label}]`,
        size: c.elements.length,
        ...c
    })).sort((c1, c2) => {

        return c2.metric.value - c1.metric.value;
    });
    const selectedMetric = sortedClusters.map((cluster) => {

        return {
            name: cluster.name,
            value: cluster.metric.value,
            fill: getHexColor(cluster.label === -1 ? '' : cluster.name),
            size: cluster.size
        };
    });
    const samples = (selectedPoints || sortedClusters[selectedClusterIndex]?.elements || []).map((p) => p.sample).flat();
    // SQL Filter for samples is sampled if there are more than 500 samples.
    const samplesSqlFilter = `${allSqlFilters} AND request_id in (${
        samples.filter(() => Math.random() < 500 / samples.length).map((s) => `'${s['request_id']}'`).join(',')
    })`;
    const samplesCsvClassNames = Array.from(new Set(samples.map((s) => s['prediction'] || s['prediction.class_name']))).join(',');
    const handleClusterClick = (i) => {
        if (selectedClusterIndex !== i) {
            setSelectedClusterIndex(i);
            setSelectedPoints(sortedClusters[i].elements);
        } else {
            setSelectedClusterIndex(null);
            setSelectedPoints(null);
        }

    };
    const handleUserSelectedAlgorithm = (value) => {
        setUserSelectedAlgorithm(value);
        onUserSelectedAlgorithm(value);
    };

    useEffect(async () => {
        const result = await getDistributionMetricsForModel(mlModelType);

        setDistributionMetricsOptions(result);
    }, [mlModelType]);

    useEffect(() => {
        setSelectedPoints(null);
    }, [clusters]);

    return (
        <>{
            clusters.length >= 100 ? (
                <Alert variant='warning'>
                    This clustering analysis is only showing the first 100 clusters. Try filtering down and/or chosing different clustering parameters to see all values.
                </Alert>
            ) : null
        }
        <Row>
            <Col>
                <BarGraph
                    bars={selectedMetric}
                    title={(
                        <Row className='g-2'>
                            <Col>Performance per Cluster</Col>
                            <Col lg={3}>
                                <Select onChange={handleUserSelectedAlgorithm}>
                                    <option value='GROUPBY'>Metadata</option>
                                    <option value='HDBSCAN'>HDBSCAN</option>
                                </Select>
                            </Col>
                            <Col lg={3}>
                                {
                                    userSelectedAlgorithm === 'HDBSCAN' ? (
                                        <Select
                                            options={[{
                                                name: 'HDBSCAN Distance: Euclidean',
                                                value: 'euclidean'
                                            }, {
                                                name: 'HDBSCAN Distance: Cosine',
                                                value: 'cosine'
                                            }]}
                                            onChange={onUserSelectedDistanceName}
                                        />
                                    ) : userSelectedAlgorithm === 'GROUPBY' ? (
                                        <AsyncSegmentationFields renderData={([data]) => (
                                            <Select onChange={onUserSelectedGroupbyField} defaultValue=''>
                                                <option value=''>No Metadata Field Selected</option>
                                                {
                                                    Object.keys(data).filter((k) => data[k] > 0).map((k) => (
                                                        <option key={k} value={k}>{k}</option>
                                                    ))
                                                }
                                            </Select>
                                        )}/>
                                    ) : null
                                }
                            </Col>
                            <Col lg={3}>
                                <Select onChange={onUserSelectedMetricName}>
                                    {
                                        metricNames.map((m) => <option key={m}>{m}</option>)
                                    }
                                </Select>
                            </Col>
                        </Row>
                    )}
                    onClick={(_, index) => handleClusterClick(index)}
                    yAxisDomain={[0, 1]}
                />
            </Col>
        </Row>
        <SpinnerWrapper>
            <Row className='my-3'>
                <Col lg={distributionMetricsOptions?.length ? 8 : 12} style={{minHeight: 440}}>
                    <ClusterGraph>
                        {sortedClusters.map((cluster, index) => (
                            <Scatter
                                key={index}
                                isAnimationActive={false}
                                cursor='pointer'
                                onClick={() => handleClusterClick(index)}
                                name={cluster.name}
                                // Samples are filtered if there are more than 500 samples.
                                data={cluster.elements.filter(() => Math.random() < 500 / cluster.elements.length).map((e) => ({
                                    clusterSize: cluster.elements.length,
                                    metricValue: cluster.metric.value,
                                    size: selectedClusterIndex === index ? 100 : 50,
                                    clusterLabel: cluster.label,
                                    ...e
                                }))}
                                fill={getHexColor(cluster.label === -1 ? '' : cluster.name)}
                                xAxisId='PCA1'
                                yAxisId='PCA2'
                            />
                        ))}
                        <ScatterTooltip animationDuration={200} content={({payload}) => {
                            const cluster = payload.find((p) => p.dataKey === 'size')?.payload;
                            const label = cluster?.clusterLabel;

                            return (
                                <div className='line-graph-tooltip bg-white p-3'>
                                    <p className='text-dark bold-text fs-5 m-0'>{Number(cluster?.metricValue).toFixed(4)}</p>
                                    <p className='text-secondary m-0 fs-7' style={{
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        maxWidth: 200
                                    }}>
                                                        [{label === -1 ? 'noise' : String(label)}]
                                    </p>

                                    {cluster?.clusterSize ?
                                        <p className='text-secondary m-0 fs-7' style={{
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 200
                                        }}>
                                                        Size: {cluster?.clusterSize}
                                        </p> :
                                        null}
                                </div>
                            );
                        }}/>
                    </ClusterGraph>
                </Col>
                {distributionMetricsOptions?.length ? (
                    <Col lg={4} className='px-3'>
                        <div className='bg-white-blue rounded p-3'>
                            <div className='text-dark bold-text d-flex align-items-center justify-content-between'>
                                <span>Summary {(selectedClusterIndex && sortedClusters[selectedClusterIndex]) ? ` - ${sortedClusters[selectedClusterIndex].name}` : ''} {samples?.length ? `(${samples.length} total)` : ''}</span>
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
                                                    name,
                                                    value,
                                                    fill: getHexColor(name)
                                                }))}
                                                title={(
                                                    <Row className='g-2'>
                                                        <Col>Class Distribution</Col>
                                                        <Col>
                                                            <Form.Control
                                                                as='select'
                                                                className='form-select w-100'
                                                                custom
                                                                required
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
                                        fetchData={() => metricsClient(`queries/${(mlModelType === 'IMAGE_CLASSIFIER' ||
                                                            mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || mlModelType === 'UNSUPERVISED_TEXT_CLASSIFIER' ||
                                                            mlModelType === 'TEXT_CLASSIFIER' || mlModelType === 'SPEECH_TO_TEXT') ?
                                            'class-distribution-1' :
                                            'class-distribution-2'}`, {
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
                        <SamplesPreview samples={samples} />
                    </div>
                </Col>
            </Row>
        </SpinnerWrapper>
        </>
    );
};

_ClustersAnalysis.propTypes = {
    clusters: PropTypes.array.isRequired,
    onUserSelectedMetricName: PropTypes.func.isRequired,
    onUserSelectedDistanceName: PropTypes.func.isRequired,
    onUserSelectedAlgorithm: PropTypes.func.isRequired,
    onUserSelectedGroupbyField: PropTypes.func.isRequired
};

const ClustersAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[model.mlModelType];
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(metricNames[0]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');
    const [userSelectedDistanceName, setUserSelectedDistanceName] = useState('euclidean');
    const [userSelectedGroupbyField, setUserSelectedGroupbyField] = useState();

    return (
        <Async
            refetchOnChanged={[
                allSqlFilters,
                userSelectedDistanceName,
                userSelectedMetricName,
                userSelectedAlgorithm,
                userSelectedGroupbyField
            ]}
            fetchData={() => metricsClient('clusters', {
                model_type: model.mlModelType,
                sql_filters: allSqlFilters,
                distance: userSelectedDistanceName,
                metric: userSelectedMetricName,
                clustering_algorithm: userSelectedAlgorithm,
                groupby_field: userSelectedGroupbyField
            })}
            renderData={(clusters = []) => (
                <_ClustersAnalysis
                    clusters={clusters}
                    onUserSelectedMetricName={setUserSelectedMetricName}
                    onUserSelectedDistanceName={setUserSelectedDistanceName}
                    onUserSelectedAlgorithm={setUserSelectedAlgorithm}
                    onUserSelectedGroupbyField={setUserSelectedGroupbyField}
                />
            )}
        />
    );
};


export default ClustersAnalysis;
