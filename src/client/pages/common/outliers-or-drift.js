import PropTypes from 'prop-types';
import {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import useModel from 'hooks/use-model';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';

const OutliersOrDrift = ({isDrift}) => {
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    const [userSelectedModelName, setUserSelectedModelName] = useState('Local Outlier Factor');
    const [userSelectedContamination, setUserSelectedContamination] = useState('auto');
    const referenceFilters = isDrift && useAllSqlFilters({useReferenceFilters: true});

    const contaminationOptions = [{
        name: 'auto',
        value: 'auto'
    }];

    for (let i = 1; i <= 25; i++) {
        contaminationOptions.push({
            name: `${i} %`,
            value: i / 100
        });
    }

    return (
        <>
            <div className='my-3'>
                <Row className='my-3'>
                    <Col></Col>
                    <Col lg={3}>
                        Algorithm
                        <Form.Control as='select' className='form-select w-100'
                            custom required
                            onChange={(e) => {
                                setUserSelectedModelName(e.target.value);
                            }}
                        >
                            <option>Local Outlier Factor</option>
                            <option>Isolation Forest</option>
                        </Form.Control>
                    </Col>
                    <Col lg={3}>
                        Contamination
                        <Form.Control as='select' className='form-select w-100'
                            custom required
                            onChange={(e) => {
                                setUserSelectedContamination(e.target.value);
                            }}
                        >
                            <option>auto</option>
                            {Array(25).fill().map((_, i) => (
                                <option value={(i + 1) / 100} key={i}>{i + 1}%</option>
                            ))}
                        </Form.Control>
                    </Col>
                </Row>
                <Row className='my-3'>
                    <Col>
                        <Async
                            refetchOnChanged={[allSqlFilters, userSelectedModelName, userSelectedContamination, referenceFilters]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: referenceFilters,
                                outlier_algorithm: userSelectedModelName,
                                contamination: userSelectedContamination,
                                model_type: mlModelType
                            })}
                            renderData={(data) => (
                                <ScatterGraph
                                    data={data?.outlier_analysis?.map(({sample, dimensions, anomaly, request_id}) => ({
                                        sample,
                                        PCA1: dimensions[0],
                                        PCA2: dimensions[1],
                                        anomaly,
                                        request_id
                                    }))}
                                    isDrift={isDrift}
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

OutliersOrDrift.propTypes = {
    isDrift: PropTypes.bool
};

export default OutliersOrDrift;
