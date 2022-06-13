import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import TopBar from 'pages/common/top-bar';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import Container from 'react-bootstrap/Container';
import Tabs from 'components/tabs';
import Menu from 'components/menu';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import Select from 'components/select';
import Spinner from 'components/spinner';
import Performance from './performance';
import Predictions from './predictions';
import Features from './features';
import FilterInput from 'pages/common/filter-input';
import Drift from './drift';
import useBenchmark from 'hooks/use-benchmark';

const Benchmarks = ({filtersStore, modelStore, benchmarkStore}) => {

    useSyncStoresToUrl(({filtersStore, segmentationStore}) => ({
        filters: JSON.stringify(filtersStore.filters),
        benchmarks: JSON.stringify(filtersStore.benchmarks.map(({benchmark_id}) => ({benchmark_id}))),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    useEffect(() => {
        benchmarkStore.fetchBenchmarks();
    }, []);

    const [benchmarkFilters, setBenchmarkFilters] = useState();
    const benchmark = useBenchmark();
    const mlModelId = benchmark?.['model_id'];
    const mlModelVersion = benchmark?.['model_version'];
    const datasetId = benchmark?.['dataset_id'];
    const model = modelStore.getModelByMlModelId(benchmark?.['model_id']);

    if (!benchmark) {

        return <Spinner/>;
    } else if (!model) {
        return `No model with id ${mlModelId}`;
    }

    const tabs = [
        {name: 'Performance Overview', to: '/benchmark/performance'}
    ];

    switch (model?.mlModelType) {
    case 'SPEECH_TO_TEXT':
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        break;
    case 'Q_N_A':
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    case 'TEXT_CLASSIFIER':
    case 'UNSUPERVISED_TEXT_CLASSIFIER':
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    case 'IMAGE_CLASSIFIER':
    case 'UNSUPERVISED_IMAGE_CLASSIFIER':
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    case 'UNSUPERVISED_OBJECT_DETECTION':
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    case 'AUTO_COMPLETION':
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        break;
    default:
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    }

    return (
        <Menu>
            <TopBar hideTimePicker/>
            <Container className='bg-white-blue text-secondary py-2' fluid>
                <Row className='align-items-center my-3 px-3'>
                    <Col className='d-flex align-items-center'>
                        <h1 className='text-dark fs-2 m-0 bold-text'>{datasetId}</h1>
                    </Col>
                </Row>
                <Row className='align-items-start mb-3 px-3'>
                    <Col className='d-flex align-items-center'>
                        <h1 className='text-dark fs-3 m-0 bold-text'>{model.name}</h1>
                        <h3 className='text-dark ms-3 fs-3'>{mlModelVersion}</h3>
                    </Col>
                    <Col>
                        <Async
                            fetchData={() => metricsClient(`benchmarks?sql_filters=${encodeURI(
                                `dataset_id='${datasetId}'`
                            )}`, null, 'get')}
                            renderData={(benchmarks) => (
                                <Select
                                    options={
                                        [{
                                            name: <span className='text-secondary fs-4'>Compare to Another Benchmark</span>,
                                            value: ''
                                        }].concat(benchmarks.map((b) => {
                                            const model = modelStore.models.find((m) => m.mlModelId === b.model_id);

                                            return {
                                                name: (
                                                    <span className='text-dark fs-4'>
                                                        {model?.name} {b.model_version} [{new Date(b.started_at).toLocaleString()}]
                                                    </span>
                                                ),
                                                value: `model_id='${b.model_id}' AND model_version='${b.model_version}' AND dataset_id='${b.dataset_id}' AND benchmark_id='${b.benchmark_id}'`
                                            };
                                        }))
                                    }
                                    onChange={setBenchmarkFilters}
                                />
                            )}
                        />
                    </Col>
                </Row>
            </Container>
            <Container fluid>
                <Tabs tabs={tabs} />
                <FilterInput
                    defaultFilters={filtersStore.filters}
                    onChange={(filters) => (filtersStore.filters = filters)}
                />
                <div className='px-3'>
                    <Route exact path='/benchmark/performance' render={() => {

                        return (
                            <Performance benchmarkFilters={benchmarkFilters}/>
                        );
                    }}/>
                    <Route exact path='/benchmark/predictions' component={Predictions}/>
                    <Route exact path='/benchmark/features' component={Features}/>
                    <Route exact path='/benchmark/drift-analysis' component={Drift}/>
                </div>
            </Container>
        </Menu>
    );
};

Benchmarks.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    modelStore: PropTypes.object.isRequired,
    benchmarkStore: PropTypes.object.isRequired
};

export default setupComponent(Benchmarks);
