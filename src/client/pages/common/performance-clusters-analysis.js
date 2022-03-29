import React, {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter} from 'recharts';
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
import SignedImage from 'components/signed-image';
import MinerModal from '../../components/miner-modal';
import useModel from 'hooks/use-model';

const PerformanceClustersAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(null);
    const [userSelectedDistanceName, setUserSelectedDistanceName] = useState('euclidean');
    const [userSelectedSummaryDistribution, setUserSelectedSummaryDistribution] = useState('prediction');
    const [selectedClusterIndex, setSelectedClusterIndex] = useState();
    const [selectedPoints, setSelectedPoints] = useState(null);
    const [exampleInModal, setExampleInModal] = useModal(false);
    const [minerModalOpen, setMinerModalOpen] = useModal(false);
    const [distributionMetricsOptions, setDistributionMetricsOptions] = useState([]);

    const getDistributionMetricsForModel = async (modelType) => {
        if (modelType === 'IMAGE_CLASSIFIER' || modelType === 'TEXT_CLASSIFIER') {
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

    React.useEffect(async () => {
        const result = await getDistributionMetricsForModel(model.mlModelType);

        setDistributionMetricsOptions(result);
    }, [model.mlModelType]);

    return (
        <Async
            refetchOnChanged={[allSqlFilters, userSelectedDistanceName]}
            fetchData={() => metricsClient('clusters', {
                model_type: model.mlModelType,
                sql_filters: allSqlFilters,
                distance: userSelectedDistanceName
            })}
            renderData={(data = []) => {
                const metricNames = data[0]?.metrics.map((m) => m.name) || [];
                const selectedMetricName = userSelectedMetricName || metricNames[0];
                const sortedClusters = data.map((c, i) => ({
                    name: `Cluster #${i + 1}`,
                    size: c.elements.length,
                    ...c
                })).sort((c1, c2) => {
                    const metric1 = c1.metrics.find((m) => m.name === selectedMetricName);
                    const metric2 = c2.metrics.find((m) => m.name === selectedMetricName);

                    return metric2.value - metric1.value;
                });
                const selectedMetric = sortedClusters.map((cluster) => {

                    return {
                        name: cluster.name,
                        value: cluster.metrics.find((m) => m.name === selectedMetricName)?.value,
                        fill: getHexColor(cluster.name),
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
                                                        onChange={setUserSelectedMetricName}
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
                                                    onChange={setUserSelectedDistanceName}
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
                                <Col lg={8} style={{height: 440}}>
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
                                                    samples: [e.sample],
                                                    size: selectedClusterIndex === index ? 100 : 50,
                                                    ...e
                                                }))}
                                                fill={getHexColor(cluster.name)}
                                                xAxisId='PCA1'
                                                yAxisId='PCA2'
                                            />
                                        ))}
                                    </ClusterGraph>
                                </Col>
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
                                                            bars={data.map(({prediction, my_percentage}) => ({
                                                                name: prediction,
                                                                value: my_percentage,
                                                                fill: getHexColor(prediction)
                                                            }))}
                                                            title={(
                                                                <Row>
                                                                    <Col>Class Distribution</Col>
                                                                    <Col style={{marginRight: -12}}>
                                                                        <Select
                                                                            options={distributionMetricsOptions}
                                                                            onChange={setUserSelectedSummaryDistribution}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            )}
                                                            unit='%'
                                                        />
                                                    )}
                                                    fetchData={() => metricsClient(`queries/${(model.mlModelType === 'IMAGE_CLASSIFIER' ||
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
                                        <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                                            {samples.length ? samples.slice(0, 100).map((sample, i) => {
                                                if (sample['image_metadata.uri']) {
                                                    const width = sample['image_metadata.width'];
                                                    const height = sample['image_metadata.height'];
                                                    const bounding_box_h = sample['image_metadata.object.height'];
                                                    const bounding_box_w = sample['image_metadata.object.width'];
                                                    const bounding_box_y = sample['image_metadata.object.top'];
                                                    const bounding_box_x = sample['image_metadata.object.left'];

                                                    return (
                                                        <div
                                                            key={i}
                                                            className='m-4 heat-map-item cursor-pointer'
                                                            onClick={() => setExampleInModal(sample)}
                                                        >
                                                            <SignedImage
                                                                alt='Example'
                                                                className='rounded'
                                                                height={200}
                                                                rawUrl={sample['image_metadata.uri']}
                                                            />
                                                            <div className='heat-map-box' style={{
                                                                height: bounding_box_h * 200 / height,
                                                                width: bounding_box_w * 200 / width,
                                                                top: bounding_box_y * 200 / height,
                                                                left: bounding_box_x * 200 / width
                                                            }}/>
                                                        </div>
                                                    );
                                                } else {

                                                    return (
                                                        <div
                                                            key={i}
                                                            className='d-flex cursor-pointer'
                                                            onClick={() => setExampleInModal(sample)}
                                                        >
                                                            <pre>{JSON.stringify(sample, null, 4)}</pre>
                                                        </div>
                                                    );
                                                }
                                            }) : (
                                                <h3 className='text-secondary m-0'>No Examples Selected</h3>
                                            )}
                                        </div>
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
                                            <SignedImage
                                                alt='Example'
                                                className='rounded'
                                                rawUrl={exampleInModal['image_metadata.uri']}
                                                height={600}
                                            />
                                            <div className='heat-map-box' style={{
                                                height: exampleInModal['image_metadata.object.height'] * 600 / exampleInModal['image_metadata.height'],
                                                width: exampleInModal['image_metadata.object.width'] * 600 / exampleInModal['image_metadata.width'],
                                                top: exampleInModal['image_metadata.object.top'] * 600 / exampleInModal['image_metadata.height'],
                                                left: exampleInModal['image_metadata.object.left'] * 600 / exampleInModal['image_metadata.width']
                                            }}/>
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
            }}
        />
    );
};


export default PerformanceClustersAnalysis;
