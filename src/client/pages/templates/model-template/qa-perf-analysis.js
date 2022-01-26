import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter} from 'recharts';

import {SpinnerWrapper} from 'components/spinner';
import Table from 'components/table';
import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
import useModel from 'customHooks/use-model';
import useModal from 'customHooks/useModal';
import Modal from 'components/modal';
import metricsClient from 'clients/metrics';
import AddFilters from 'components/add-filters';
import {Filter} from 'state/stores/filters-store';

const QAPerfAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(null);
    const [selectedClusterIndex, setSelectedClusterIndex] = useState();
    const [selectedPoints, setSelectedPoints] = useState(null);
    const [exampleInModal, setExampleInModal] = useModal(false);

    return (
        <Async
            refetchOnChanged={[allSqlFilters]}
            fetchData={() => metricsClient('clusters', {
                model_type: model.mlModelType,
                sql_filters: allSqlFilters
            })}
            renderData={(data = []) => {
                const metricNames = data[0]?.metrics.map((m) => m.name) || [];
                const selectedMetricName = userSelectedMetricName || metricNames[0];
                const sortedClusters = data.map((c, i) => ({
                    name: `Cluster #${i + 1}`,
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
                        fill: getHexColor(cluster.name)
                    };
                });
                const samples = (selectedPoints || sortedClusters[selectedClusterIndex]?.elements || []).map((p) => p.sample).flat().slice(0, 10);
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
                                        </Row>
                                    )}
                                    onClick={(_, index) => handleClusterClick(index)}
                                    yAxisDomain={[0, 1]}
                                />
                            </Col>
                        </Row>
                        <SpinnerWrapper>
                            <Row className='my-3'>
                                <Col lg={8}>
                                    <ClusterGraph>
                                        {sortedClusters.map((cluster, index) => (
                                            <Scatter
                                                key={index}
                                                isAnimationActive={false}
                                                cursor='pointer'
                                                onClick={() => handleClusterClick(index)}
                                                name={cluster.name}
                                                data={cluster.elements.map((e) => ({
                                                    samples: [e.sample],
                                                    size: selectedClusterIndex === index ? 200 : 100,
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
                                            <span>Examples</span>
                                            <AddFilters disabled={!samples?.length} filters={[new Filter({
                                                left: 'request_id',
                                                op: 'in',
                                                right: samples.map((s) => s.request_id)
                                            })]}/>
                                        </div>
                                        <div className={`d-flex p-2 overflow-auto flex-grow-0 ${samples.length ? 'justify-content-left' : 'justify-content-center align-items-center'} scatterGraph-examples`}>
                                            {samples.length ? samples.map((sample, i) => (
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
                                        accessor: (c) => c[k]
                                    }))}
                                    data={[exampleInModal]}
                                />
                            </Modal>
                        )}
                    </>
                );
            }}
        />
    );
};

QAPerfAnalysis.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(QAPerfAnalysis);
