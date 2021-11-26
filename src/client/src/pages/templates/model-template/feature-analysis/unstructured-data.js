import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Select from 'components/select';
import {setupComponent} from 'helpers/component-helper';
import {getHexColor} from 'helpers/color-helper';
import FilterInput from 'components/filter-input';
import BarGraph from 'components/bar-graph';
import Async from 'components/async';
import baseJsonClient from 'clients/base-json-client';
import useAllSqlFilters from 'customHooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import useModel from 'customHooks/use-model';

const FeatureAnalysisUnstructuredData = ({filtersStore}) => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();
    const [selectedMetric, setSelectedMetric] = useState(null);

    return (
        <div>
            <FilterInput
                defaultFilters={filtersStore.filters}
                onChange={(filters) => (filtersStore.filters = filters)}
            />
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
                    const clusterElements = data.map((d) => d.elements).flat(1);

                    return (
                        <div className='my-5'>
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
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ScatterGraph data={clusterElements.map(({PCA1, PCA2, sample}) => ({
                                        samples: [sample],
                                        PCA1,
                                        PCA2
                                    }))}/>
                                </Col>
                            </Row>
                        </div>
                    );
                }}
            />
        </div>
    );
};

FeatureAnalysisUnstructuredData.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(FeatureAnalysisUnstructuredData);
