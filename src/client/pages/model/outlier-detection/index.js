import {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Select from 'components/select';
import useModel from 'hooks/use-model';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';

const OutlierDetection = () => {
    const {mlModelType} = useModel();
    const allSqlFilters = useAllSqlFilters();
    // const allOfflineSqlFilters = useAllSqlFilters({useReferenceFilters: true});

    const [userSelectedModelName, setUserSelectedModelName] = useState('Local Outlier Factor');
    const [userSelectedContamination, setUserSelectedContamination] = useState('auto');

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
                <Row>
                    <Col>Parameters</Col>
                    <Col lg={3} style={{marginRight: -12}}>
                        Algorithm
                        <Select
                            options={[{
                                name: 'Local Outlier Factor',
                                value: 'Local Outlier Factor'
                            }, {
                                name: 'Isolation Forest',
                                value: 'Isolation Forest'
                            }]}
                            onChange={setUserSelectedModelName}
                        />
                    </Col>
                    <Col lg={3} style={{marginRight: -12}}>
                        Contamination
                        <Select
                            options={contaminationOptions}
                            onChange={setUserSelectedContamination}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Async
                            refetchOnChanged={[allSqlFilters, userSelectedModelName, userSelectedContamination]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: 'False',
                                outlier_algorithm: userSelectedModelName,
                                contamination: userSelectedContamination,
                                model_type: mlModelType
                            })}
                            renderData={(data) => (
                                <ScatterGraph
                                    data={data?.outlier_analysis?.map(({sample, dimensions, outlier, novelty, request_id}) => ({
                                        sample,
                                        PCA1: dimensions[0],
                                        PCA2: dimensions[1],
                                        outlier,
                                        novelty,
                                        request_id
                                    }))}
                                    outlierDetectionOnly
                                />
                            )}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OutlierDetection;
