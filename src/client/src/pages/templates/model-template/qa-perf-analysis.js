import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter} from 'recharts';

import Spinner, {SpinnerWrapper} from 'components/spinner';
import Table from 'components/table';
import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import baseJsonClient from 'clients/base-json-client';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
import useModel from 'customHooks/use-model';
import useModal from 'customHooks/useModal';
import Modal from 'components/modal';
import BtnIcon from 'components/btn-icon';
import {IconNames} from 'constants';

const QAPerfAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const [userSelectedMetricName, setUserSelectedMetricName] = useState(null);
    const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);
    const [selectedPoints, setSelectedPoints] = useState(null);
    const [exampleInModal, setExampleInModal] = useModal(false);

    return (
        <>
            <h3 className='text-dark bold-text fs-3 mb-3'>Clusters Performance</h3>
            <Async
                refetchOnChanged={[allSqlFilters]}
                fetchData={() => baseJsonClient('/api/metrics/clusters', {
                    method: 'post',
                    body: {
                        model_type: model.mlModelType,
                        sql_filters: allSqlFilters
                    }
                })}
                renderData={(data = [], loading) => {
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
                        setSelectedClusterIndex(i);
                        setSelectedPoints(sortedClusters[i].elements);
                    };

                    return (
                        <>
                            <Row>
                                <Col lg={{span: 3, offset: 9}}>
                                    <Select
                                        options={metricNames.map((m) => ({
                                            name: m,
                                            value: m
                                        }))}
                                        initialValue={selectedMetricName}
                                        onChange={setUserSelectedMetricName}
                                    />
                                </Col>
                                <Col lg={12}>
                                    <BarGraph
                                        loading={loading}
                                        bars={selectedMetric}
                                        title='Performance per Cluster'
                                        onClick={(_, index) => handleClusterClick(index)}
                                    />
                                </Col>
                            </Row>

                            <SpinnerWrapper>
                                <Spinner loading={loading}/>
                                <Row>
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
                                                        size: selectedClusterIndex === index ? 300 : 200,
                                                        ...e
                                                    }))}
                                                    fill={getHexColor(cluster.name)}
                                                    xAxisId='PCA1'
                                                    yAxisId='PCA2'
                                                />
                                            ))}
                                        </ClusterGraph>
                                    </Col>
                                    <Col lg={4} className='rounded p-3 bg-white-blue'>
                                        <p className='text-dark m-0 bold-text'>Examples</p>
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
                                                <h3 className='text-secondary m-0'>No Examples Available</h3>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </SpinnerWrapper>
                            {exampleInModal && (
                                <Modal isOpen={true} onClose={() => setExampleInModal(null)}>
                                    <div className='d-flex align-items-center pb-3'>
                                        <p className='m-0 flex-grow-1'></p>
                                        <BtnIcon
                                            className='border-0'
                                            icon={IconNames.CLOSE}
                                            onClick={() => setExampleInModal(null)}
                                            size={15}
                                        />
                                    </div>
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
        </>
    );
};

QAPerfAnalysis.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(QAPerfAnalysis);
