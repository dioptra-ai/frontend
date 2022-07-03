import PropTypes from 'prop-types';
import {useState} from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterChart from 'components/scatter-chart';
import metricsClient from 'clients/metrics';
import theme from 'styles/theme.module.scss';
import SamplesPreview from 'components/samples-preview';

const OutliersOrDrift = ({isDrift}) => {
    const allSqlFilters = useAllSqlFilters();
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('Local Outlier Factor');
    const [userSelectedContamination, setUserSelectedContamination] = useState('auto');
    const [selectedPoints, setSelectedPoints] = useState([]);
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const referenceFilters = isDrift && useAllSqlFilters({useReferenceFilters: true});
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
                                setUserSelectedAlgorithm(e.target.value);
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
                <Row className='border rounded p-3 w-100 scatterGraph'>
                    <Col lg={4}>
                        <Async
                            refetchOnChanged={[allSqlFilters, userSelectedAlgorithm, userSelectedContamination, referenceFilters]}
                            fetchData={() => metricsClient('compute', {
                                metrics_type: 'outlier_detection',
                                current_filters: allSqlFilters,
                                reference_filters: referenceFilters,
                                outlier_algorithm: userSelectedAlgorithm,
                                contamination: userSelectedContamination
                            })}
                            renderData={(data) => (
                                <div className='scatterGraph-leftBox'>
                                    <ScatterChart
                                        data={data?.outlier_analysis?.map(({
                                            sample, dimensions, anomaly
                                        }) => ({
                                            sample, anomaly, dimensions
                                        }))}
                                        getX={(p) => p.dimensions[0]}
                                        getY={(p) => p.dimensions[1]}
                                        getColor={(p) => p.anomaly ? (isDrift ? theme.dark : theme.warning) : theme.secondary}
                                        onSelectedDataChange={handleSelectedDataChange}
                                        isDatapointSelected={(p) => uniqueSampleUUIDs.has(p.sample['uuid'])}
                                    />
                                </div>
                            )}
                        />
                    </Col>
                    <Col className='rounded p-3 bg-white-blue'>
                        <SamplesPreview samples={selectedPoints?.map(({sample}) => sample)} onClearSample={handleClearSample}/>
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
