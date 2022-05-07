import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter, Tooltip as ScatterTooltip} from 'recharts';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {BsMinecartLoaded} from 'react-icons/bs';
import {saveAs} from 'file-saver';
import {SpinnerWrapper} from 'components/spinner';
import Table from 'components/table';
import Select from 'components/select';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
import useModal from 'hooks/useModal';
import Modal from 'components/modal';
import metricsClient from 'clients/metrics';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';
import {ImageClassificationFrameWithBoundingBox} from 'components/frame-with-bounding-box';
import MinerModal from 'components/miner-modal';
import useModel from 'hooks/use-model';
import Form from 'react-bootstrap/Form';

// Keep this in sync with metrics-engine/handlers/clusters.py
const MODEL_TYPE_TO_METRICS_NAMES = {
    'Q_N_A': ['EXACT_MATCH', 'F1_SCORE'],
    'AUTO_COMPLETION': ['EXACT_MATCH', 'F1_SCORE'],
    'SPEECH_TO_TEXT': ['EXACT_MATCH', 'WORD_ERROR_RATE'],
    'TEXT_CLASSIFIER': ['ACCURACY', 'F1_SCORE', 'PRECISION', 'RECALL'],
    'UNSUPERVISED_OBJECT_DETECTION': ['MEAN_AVERAGE_PRECISION', 'MEAN_AVERAGE_RECALL'],
    'IMAGE_CLASSIFIER': ['ACCURACY', 'PRECISION', 'F1_SCORE', 'RECALL'],
    'UNSUPERVISED_IMAGE_CLASSIFIER': ['CONFIDENCE'],
    'SEMANTIC_SIMILARITY': ['PEARSON_CONSINE', 'SPEARMAN_COSINE']
};

const _PerformanceClustersAnalysis = ({clusters, onUserSelectedMetricName, onUserSelectedDistanceName}) => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[model.mlModelType];
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedClusterIndex, setSelectedClusterIndex] = useState();
    const [selectedPoints, setSelectedPoints] = useState(null);
    const [exampleInModal, setExampleInModal] = useModal(false);
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);
    const getDistributionMetricsForModel = async (modelType) => {
        if (modelType === 'IMAGE_CLASSIFIER' || modelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' || modelType === 'TEXT_CLASSIFIER') {
            return [{
                name: 'prediction',
                value: 'prediction'
            }, {
                name: 'groundtruth',
                value: 'groundtruth'
            }];
        } else if (modelType === 'SPEECH_TO_TEXT') {
            const results = await metricsClient('queries/fairness-bias-columns-names-for-audio-metadata-and-tags');

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

    useEffect(async () => {
        const result = await getDistributionMetricsForModel(model.mlModelType);

        setDistributionMetricsOptions(result);
    }, [model.mlModelType]);

    useEffect(() => {
        setSelectedPoints(null);
    }, [clusters]);

    return (
        <>
            <Row>
                <Col>
                    <BarGraph
                        bars={selectedMetric}
                        title={(
                            <Row>
                                <Col>Performance per Cluster</Col>
                                <Col lg={3} style={{marginRight: -12}}>
                                    {metricNames.length ? (
                                        <Select
                                            options={metricNames.map((m) => ({
                                                name: m,
                                                value: m
                                            }))}
                                            onChange={onUserSelectedMetricName}
                                        />
                                    ) : null}
                                </Col>
                                <Col lg={3} style={{marginRight: -12}}>
                                    <Select
                                        options={[{
                                            name: 'Euclidean Distance',
                                            value: 'euclidean'
                                        }, {
                                            name: 'Cosine Distance',
                                            value: 'cosine'
                                        }]}
                                        onChange={onUserSelectedDistanceName}
                                    />
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
                    <Col lg={distributionMetricsOptions?.length ? 8 : 12} style={{height: 440}}>
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
                                    <span>Summary {selectedClusterIndex ? ` - ${sortedClusters[selectedClusterIndex].name}` : ''} {samples?.length ? `(${samples.length} total)` : ''}</span>
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
                                            refetchOnChanged={[samplesSqlFilter, samples, model.mlModelType]}
                                            renderData={(data) => (
                                                <BarGraph
                                                    bars={data.map(({name, value}) => ({
                                                        name,
                                                        value,
                                                        fill: getHexColor(name)
                                                    }))}
                                                    title={(
                                                        <Row>
                                                            <Col>Class Distribution</Col>
                                                            <Col style={{marginRight: -12}}>
                                                                <Form.Control
                                                                    as='select'
                                                                    className='form-select bg-light w-100'
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
                                            fetchData={() => metricsClient(`queries/${(model.mlModelType === 'IMAGE_CLASSIFIER' ||
                                                            model.mlModelType === 'UNSUPERVISED_IMAGE_CLASSIFIER' ||
                                                                model.mlModelType === 'TEXT_CLASSIFIER' || model.mlModelType === 'SPEECH_TO_TEXT') ?
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
                            <div className='text-dark bold-text d-flex align-items-center justify-content-between'>
                                <span>Examples {samples?.length ? `(${samples.length} total)` : ''}</span>
                                <div className='d-flex align-items-center'>
                                    <AddFilters
                                        disabled={!samples?.length}
                                        filters={[new Filter({
                                            left: 'request_id',
                                            op: 'in',
                                            right: samples.map((s) => s.request_id)
                                        })]}
                                        tooltipText='Filter-in these examples'
                                    />
                                    <OverlayTrigger overlay={<Tooltip>Download samples as JSON</Tooltip>}>
                                        <IoDownloadOutline className='fs-2 cursor-pointer' onClick={() => {

                                            saveAs(new Blob([JSON.stringify(samples)], {type: 'application/json;charset=utf-8'}), 'samples.json');
                                        }}/>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Mine for Similar Datapoints</Tooltip>}>
                                        <BsMinecartLoaded className='fs-2 ps-2 cursor-pointer' onClick={() => {
                                            setMinerModalOpen(true);
                                        }}/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                            <Row className={'p-2 overflow-auto scatterGraph-examples'}>
                                {samples.length ? samples.slice(0, 100).map((sample) => {
                                    if (sample['image_metadata.uri']) {

                                        return (
                                            <Col
                                                xs={6} md={4} xl={3}
                                                key={JSON.stringify(sample)}
                                                className='p-4 heat-map-item cursor-pointer'
                                            >
                                                <ImageClassificationFrameWithBoundingBox
                                                    sample={sample}
                                                    height={200}
                                                    onClick={() => setExampleInModal(sample)}
                                                />
                                            </Col>
                                        );
                                    } else {

                                        return (
                                            <Col
                                                xs={6} md={4} xl={3} xxl={2}
                                                key={JSON.stringify(sample)}
                                                className='d-flex cursor-pointer'
                                                onClick={() => setExampleInModal(sample)}
                                            >
                                                <pre>{JSON.stringify(sample, null, 4)}</pre>
                                            </Col>
                                        );
                                    }
                                }) : (
                                    <h3 className='text-secondary m-0'>No Examples Selected</h3>
                                )}
                            </Row>
                        </div>
                    </Col>
                </Row>
            </SpinnerWrapper>
            {exampleInModal ? (
                <Modal isOpen onClose={() => setExampleInModal(null)} title=''>
                    {
                        exampleInModal['image_metadata.uri'] ? (
                            <div
                                className='m-4 heat-map-item'
                            >
                                <ImageClassificationFrameWithBoundingBox
                                    sample={exampleInModal}
                                    height={600}
                                    zoomable
                                />
                            </div>
                        ) : (
                            <Table
                                columns={Object.keys(exampleInModal).map((k) => ({
                                    Header: k,
                                    accessor: (c) => <pre style={{textAlign: 'left', whiteSpace: 'break-spaces'}}>{c[k]}</pre>
                                }))}
                                data={[exampleInModal]}
                            />
                        )
                    }
                </Modal>
            ) : null}
            <MinerModal isOpen={minerModalOpen} closeCallback={() => setMinerModalOpen(false)} samples={samples}/>
        </>
    );
};

_PerformanceClustersAnalysis.propTypes = {
    clusters: PropTypes.array.isRequired,
    onUserSelectedMetricName: PropTypes.func.isRequired,
    onUserSelectedDistanceName: PropTypes.func.isRequired
};

const PerformanceClustersAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const metricNames = MODEL_TYPE_TO_METRICS_NAMES[model.mlModelType];
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(metricNames[0]);
    const [userSelectedDistanceName, setUserSelectedDistanceName] = useState('euclidean');

    return (
        <Async
            refetchOnChanged={[allSqlFilters, userSelectedDistanceName, userSelectedMetricName]}
            fetchData={() => metricsClient('clusters', {
                model_type: model.mlModelType,
                sql_filters: allSqlFilters,
                distance: userSelectedDistanceName,
                metric: userSelectedMetricName
            })}
            renderData={(clusters = []) => (
                <_PerformanceClustersAnalysis
                    clusters={clusters}
                    onUserSelectedMetricName={setUserSelectedMetricName}
                    onUserSelectedDistanceName={setUserSelectedDistanceName}
                />
            )}
        />
    );
};


export default PerformanceClustersAnalysis;
