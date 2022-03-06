import {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter} from 'recharts';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {IoDownloadOutline} from 'react-icons/io5';
import {BsMinecartLoaded} from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import {saveAs} from 'file-saver';
import {SpinnerWrapper} from 'components/spinner';
import Table from 'components/table';
import Select from 'components/select';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
import useModel from 'hooks/use-model';
import useModal from 'hooks/useModal';
import Modal from 'components/modal';
import metricsClient from 'clients/metrics';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';

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
    const [minerDatasetSelected, setMinerDatasetSelected] = useState(false);

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
                const samplesSqlFilter = `${allSqlFilters} AND request_id in (${samples.map((s) => `'${s['request_id']}'`).join(',')})`;
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
                                                data={cluster.elements.filter(() => Math.random() < 1000 / cluster.elements.length).map((e) => ({
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
                                            <span>Summary {samples?.length ? `(${samples.length})` : ''}</span>
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
                                                                            options={[{
                                                                                name: 'prediction',
                                                                                value: 'prediction'
                                                                            }, {
                                                                                name: 'groundtruth',
                                                                                value: 'groundtruth'
                                                                            }]}
                                                                            onChange={setUserSelectedSummaryDistribution}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            )}
                                                            unit='%'
                                                        />
                                                    )}
                                                    fetchData={() => metricsClient(`queries/${(model.mlModelType === 'IMAGE_CLASSIFIER' ||
                                                            model.mlModelType === 'TEXT_CLASSIFIER') ?
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
                                            {samples.length ? samples.slice(0, 100).map((sample, i) => (
                                                <div
                                                    key={i}
                                                    className='d-flex cursor-pointer'
                                                    onClick={() => setExampleInModal(sample)}
                                                >
                                                    <pre>{JSON.stringify(sample, null, 4)}</pre>
                                                </div>
                                            )) : (
                                                <h3 className='text-secondary m-0'>No Examples Selected</h3>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </SpinnerWrapper>
                        {exampleInModal && (
                            <Modal isOpen onClose={() => setExampleInModal(null)} title=''>
                                <Table
                                    columns={Object.keys(exampleInModal).map((k) => ({
                                        Header: k,
                                        accessor: (c) => <pre style={{textAlign: 'left', whiteSpace: 'break-spaces'}}>{c[k]}</pre>
                                    }))}
                                    data={[exampleInModal]}
                                />
                            </Modal>
                        )}
                        {minerModalOpen ? (
                            <Modal isOpen onClose={() => setMinerModalOpen(false)} title='Mine for Similar Datapoints'>
                                <div style={{width: 500}}>
                                    Create a new miner that will search for datapoints that are close to the selected {samples.length} examples in the embedding space.
                                </div>
                                <Form onSubmit={(e) => {
                                    e.preventDefault();
                                    setMinerModalOpen(false);
                                }}>
                                    <Form.Label className='mt-3 mb-0 w-100'>
                                        Source
                                    </Form.Label>
                                    <InputGroup className='mt-1 flex-column'>
                                        <Form.Control
                                            as='select'
                                            className={'form-select bg-light w-100'}
                                            custom
                                            required
                                            onChange={(e) => {
                                                setMinerDatasetSelected(e.target.value === 'true');
                                            }}
                                        >
                                            <option disabled>
                                                Select Source
                                            </option>
                                            <option value={false}>Live traffic of "{model.name}"</option>
                                            <option value={true}>Dataset</option>
                                        </Form.Control>
                                    </InputGroup>
                                    {
                                        minerDatasetSelected ? (
                                            <>

                                                <Form.Label className='mt-3 mb-0 w-100'>
                                                    Dataset Location
                                                </Form.Label>
                                                <InputGroup className='mt-1'>
                                                    <Form.Control placeholder='s3://'/>
                                                </InputGroup>
                                            </>
                                        ) : null
                                    }
                                    <Button
                                        className='w-100 text-white btn-submit mt-3'
                                        variant='primary' type='submit'>Create Miner</Button>
                                </Form>
                            </Modal>
                        ) : null}
                    </>
                );
            }}
        />
    );
};

export default PerformanceClustersAnalysis;
