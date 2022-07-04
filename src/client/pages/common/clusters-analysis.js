import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
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
import ScatterChart from 'components/scatter-chart';
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
    } else {
        return [];
    }
};

const _ClustersAnalysis = ({clusters, onUserSelectedMetricName, onUserSelectedDistanceName, onUserSelectedAlgorithm, onUserSelectedGroupbyField}) => {
    const samplingLimit = 10000;
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[mlModelType];
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('GROUPBY');
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const sortedClusters = useMemo(() => clusters.map((c) => ({
        name: c.label === -1 ? '[noise]' : c.label ? `[${c.label}]` : '',
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
            {
                metricNames ? (
                    <Col lg={3}>
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
            <Col lg={3}>
                Cluster Grouping
                <Select onChange={handleUserSelectedAlgorithm}>
                    <option value='GROUPBY'>Metadata</option>
                    <option value='HDBSCAN'>HDBSCAN</option>
                </Select>
            </Col>
            {
                userSelectedAlgorithm === 'HDBSCAN' ? (
                    <Col lg={3}>
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
                ) : userSelectedAlgorithm === 'GROUPBY' ? (
                    <Col lg={3}>
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
                                fill: getHexColor(cluster.label),
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
        <Row className='my-3'>
            <Col lg={8} style={{minHeight: 440}}>
                <ScatterChart
                    data={sortedClusters.map((cluster) => cluster.elements.map((e) => ({
                        ...e,
                        color: getHexColor(cluster.label)
                    }))).flat()}
                    getX={(p) => p['PCA1']}
                    getY={(p) => p['PCA2']}
                    getColor={(p) => p.color}
                    onSelectedDataChange={handleSelectedDataChange}
                    isDatapointSelected={(p) => uniqueSampleUUIDs.has(p.sample['uuid'])}
                />
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
                    <SamplesPreview samples={samples} onClearSample={handleClearSample}/>
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
    onUserSelectedAlgorithm: PropTypes.func.isRequired,
    onUserSelectedGroupbyField: PropTypes.func.isRequired
};

const ClustersAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[model?.mlModelType];
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(metricNames?.[0]);
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
                model_type: model?.mlModelType,
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
