import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {Scatter} from 'recharts';

import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import baseJsonClient from 'clients/base-json-client';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ClusterGraph from 'components/cluster-graph';
import useModel from 'customHooks/use-model';

const QAPerfAnalysis = () => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);

    return (
        <Async
            refetchOnChanged={[allSqlFilters]}
            fetchData={() => baseJsonClient('/api/metrics/clusters', {
                method: 'post',
                body: {
                    model_type: model.mlModelType,
                    sql_filters: allSqlFilters
                }
            })}
            renderData={(data) => {
                const metricValues = data.map((d) => {
                    if (selectedMetric) {

                        return d.metrics.find((m) => m.name === selectedMetric);
                    } else {

                        return d.metrics[0];
                    }
                });
                const metricNames = data.length ? data[0].metrics.map((m) => m.name) : [];

                return (
                    <>
                        <h3 className='text-dark bold-text fs-3 mb-3'>Clusters Performance</h3>
                        <Row>
                            <Col lg={{span: 3, offset: 9}}>
                                <Select
                                    options={metricNames.map((m) => ({
                                        name: m,
                                        value: m
                                    }))}
                                    initialValue={metricNames[0]}
                                    onChange={setSelectedMetric}
                                />
                            </Col>
                            <Col lg={12}>
                                <BarGraph
                                    bars={metricValues.map((metric, i) => ({
                                        name: `Cluster #${i + 1}`,
                                        value: metric.value,
                                        fill: getHexColor(i)
                                    }))}
                                    title='Performance per Cluster'
                                    onClick={(_, index) => setSelectedClusterIndex(index)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <ClusterGraph
                                    chartWidth={8}
                                    examplesWidth={4}
                                >{({setSelectedPoints}) => {

                                        return data.map((cluster, i) => (
                                            <Scatter
                                                key={i}
                                                isAnimationActive={false}
                                                cursor='pointer'
                                                onClick={() => {
                                                    setSelectedPoints(cluster.elements.map((e) => ({
                                                        samples: [e.sample],
                                                        size: selectedClusterIndex === i ? 300 : 200,
                                                        ...e
                                                    })));
                                                    setSelectedClusterIndex(i);
                                                }}
                                                name={`Cluster #${i + 1}`}
                                                data={cluster.elements.map((e) => ({
                                                    samples: [e.sample],
                                                    size: selectedClusterIndex === i ? 300 : 200,
                                                    ...e
                                                }))}
                                                fill={getHexColor(i)}
                                                xAxisId='PCA1'
                                                yAxisId='PCA2'
                                            />
                                        ));
                                    }}</ClusterGraph>
                            </Col>
                        </Row>
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
