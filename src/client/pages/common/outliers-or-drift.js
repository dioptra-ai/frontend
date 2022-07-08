import PropTypes from 'prop-types';
import {useState} from 'react';
import * as d3 from 'd3';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import {BsCircleFill} from 'react-icons/bs';

import Select from 'components/select';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterChart, {ScatterSearch} from 'components/scatter-chart';
import metricsClient from 'clients/metrics';
import theme from 'styles/theme.module.scss';
import SamplesPreview from 'components/samples-preview';
import useModel from 'hooks/use-model';

const getEmbeddingsFieldsForModel = (modelType) => {
    const results = [{
        name: 'Image Embeddings',
        value: 'embeddings'
    }];

    if (modelType === 'UNSUPERVISED_OBJECT_DETECTION') {
        results.push({
            name: 'Prediction Box Embeddings',
            value: 'prediction.embeddings'
        });
    } else if (modelType === 'OBJECT_DETECTION') {
        results.push({
            name: 'Prediction Box Embeddings',
            value: 'prediction.embeddings'
        }, {
            name: 'Ground Truth Box Embeddings',
            value: 'groundtruth.embeddings'
        });
    }

    return results;
};

const OutliersOrDrift = ({isDrift}) => {
    const model = useModel();
    const mlModelType = model?.mlModelType;
    const allSqlFilters = useAllSqlFilters();
    const [userSelectedAlgorithm, setUserSelectedAlgorithm] = useState('Local Outlier Factor');
    const [userSelectedContamination, setUserSelectedContamination] = useState('auto');
    const [userSelectedEmbeddings, setUserSelectedEmbeddings] = useState(getEmbeddingsFieldsForModel(mlModelType)[0].value);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const uniqueSampleUUIDs = new Set(selectedPoints.map(({sample}) => sample['uuid']));
    const referenceFilters = isDrift && useAllSqlFilters({useReferenceFilters: true});
    const handleClearSamples = (uuids) => {
        const uuidsSet = new Set(uuids);

        setSelectedPoints(selectedPoints.filter((p) => !uuidsSet.has(p.sample['uuid'])));
    };
    const handleSelectedDataChange = (points, e) => {
        if (points.length === 1) {
            const uuidToRemove = points[0]['sample']['uuid'];
            const point = selectedPoints.find(({sample}) => sample['uuid'] === uuidToRemove);

            if (point) {
                handleClearSamples([point.sample['uuid']]);

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
            <Row className='g-2 my-2'>
                <Col></Col>
                <Col lg={3}>
                    Analysis Space
                    <Select onChange={setUserSelectedEmbeddings}>
                        {getEmbeddingsFieldsForModel(mlModelType).map((o, i) => (
                            <option key={i} value={o.value}>{o.name}</option>
                        ))}
                    </Select>
                </Col>
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
            <Async
                refetchOnChanged={[
                    allSqlFilters,
                    userSelectedAlgorithm,
                    userSelectedContamination,
                    referenceFilters,
                    userSelectedEmbeddings
                ]}
                fetchData={() => metricsClient('compute', {
                    metrics_type: 'outlier_detection',
                    current_filters: allSqlFilters,
                    reference_filters: referenceFilters,
                    outlier_algorithm: userSelectedAlgorithm,
                    contamination: userSelectedContamination,
                    embeddings_field: userSelectedEmbeddings
                })}
                renderData={(data) => (
                    <Row className='g-2 mb-3 w-100 scatterGraph'>
                        <Col lg={4}>
                            <div className='scatterGraph-leftBox'>
                                <ScatterChart
                                    data={data?.outlier_analysis?.map(({
                                        sample, dimensions, anomaly
                                    }) => ({
                                        sample, anomaly, dimensions
                                    }))}
                                    getX={(p) => p.dimensions[0]}
                                    getY={(p) => p.dimensions[1]}
                                    getColor={(p) => {
                                        const color = p.anomaly ? (isDrift ? theme.primary : theme.danger) : theme.secondary;

                                        if (uniqueSampleUUIDs.size && !uniqueSampleUUIDs.has(p.sample['uuid'])) {

                                            return d3.hsl(color).copy({l: 0.9});
                                        } else {

                                            return color;
                                        }
                                    }}
                                    onSelectedDataChange={handleSelectedDataChange}
                                    isDatapointSelected={(p) => uniqueSampleUUIDs.has(p.sample['uuid'])}
                                    isSearchMatch={(p, searchTerm) => Object.values(p.sample).some((v) => v?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))}
                                />
                            </div>
                            <Row className='g-2 mb-3'>
                                <Col className='text-center'>
                                    <div
                                        className='cursor-pointer d-inline-block'
                                        style={{color: isDrift ? theme.primary : theme.danger}}
                                        onClick={(e) => handleSelectedDataChange(data?.outlier_analysis.filter((p) => p['anomaly']), e)}
                                    >
                                        <BsCircleFill/>&nbsp;<span className='text-decoration-underline'>{isDrift ? 'Drift' : 'Outliers'}</span>
                                    </div>
                                </Col>
                                <Col className='text-center'>
                                    <div
                                        className='cursor-pointer d-inline-block'
                                        style={{color: theme.secondary}}
                                        onClick={(e) => handleSelectedDataChange(data?.outlier_analysis.filter((p) => !p['anomaly']), e)}
                                    >
                                        <BsCircleFill/>&nbsp;<span className='text-decoration-underline'>{isDrift ? 'Normal' : 'Inliers'}</span>
                                    </div>
                                </Col>
                            </Row>
                            <Row className='g-2'>
                                <Col>
                                    <ScatterSearch
                                        data={data?.outlier_analysis} onSelectedDataChange={handleSelectedDataChange}
                                        isSearchMatch={(p, searchTerm) => Object.values(p.sample).some((v) => v?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase()))}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col className='rounded p-3 bg-white-blue'>
                            <SamplesPreview samples={selectedPoints?.map(({sample}) => sample)} onClearSamples={handleClearSamples}/>
                        </Col>
                    </Row>
                )}
            />
        </>
    );
};

OutliersOrDrift.propTypes = {
    isDrift: PropTypes.bool
};

export default OutliersOrDrift;
