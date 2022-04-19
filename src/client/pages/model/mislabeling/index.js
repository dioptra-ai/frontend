import {useState} from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import {setupComponent} from 'helpers/component-helper';
import {Filter} from 'state/stores/filters-store';
import useModel from 'hooks/use-model';
import Async from 'components/async';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import ScatterGraph from 'components/scatter-graph';
import metricsClient from 'clients/metrics';

const _SetGroundtruthFilter = ({filtersStore, onChange}) => {
    const allSqlFilters = useAllSqlFilters();
    const model = useModel();

    return (
        <Async
            refetchOnChanged={[allSqlFilters]}
            fetchData={() => metricsClient('queries/get-suggestions-with-key', {
                key: 'groundtruth',
                value: '',
                ml_model_id: model?.mlModelId,
                limit: 500
            })}
            renderData={(data) => (
                <>
                    <Form.Control
                        as='select'
                        className='form-select w-100'
                        custom
                        required
                        onChange={(e) => {
                            const v = e.target.value;

                            if (v) {
                                filtersStore.setFilter(new Filter({left: 'groundtruth', op: '=', right: e.target.value}));
                            } else {
                                filtersStore.removeFilterByKey('groundtruth');
                            }
                            onChange?.(v);
                        }}
                    >
                        <option value=''>Select Class</option>
                        {data.map(({value}, i) => (
                            <option key={i} value={value}>{value}</option>
                        ))}
                    </Form.Control>
                </>
            )}
        />
    );
};

_SetGroundtruthFilter.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    filters: PropTypes.arrayOf(PropTypes.instanceOf(Filter)).isRequired,
    onChange: PropTypes.func
};

const SetGroundtruthFilter = setupComponent(_SetGroundtruthFilter);

const Mislabeling = () => {
    const [selectedGroundTruth, setSelectedGroundTruth] = useState(null);
    const allSqlFilters = useAllSqlFilters();
    const allOfflineSqlFilters = useAllSqlFilters({useReferenceFilters: true});
    const {mlModelType} = useModel();

    return (
        <>
            <SetGroundtruthFilter onChange={(cl) => setSelectedGroundTruth(cl)}/>
            <div className='my-3'>
                <Row>
                    <Col>
                        {selectedGroundTruth ? (
                            <Async
                                refetchOnChanged={[allOfflineSqlFilters, allSqlFilters]}
                                fetchData={() => metricsClient('compute', {
                                    metrics_type: 'outlier_detection',
                                    current_filters: allSqlFilters,
                                    reference_filters: allOfflineSqlFilters,
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
                                        examplesType='image'
                                        outliersAreMislabeled
                                    />
                                )}
                            />
                        ) : (

                            <h3 className='text-secondary m-0'>Select a class to detect mislabeled datapoints.</h3>
                        )}
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Mislabeling;
