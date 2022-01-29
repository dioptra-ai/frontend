import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Redirect, Route} from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import GeneralSearchBar from 'pages/templates/general-search-bar';
import useSyncStoresToUrl from 'customHooks/use-sync-stores-to-url';
import Container from 'react-bootstrap/Container';
import Tabs from 'components/tabs';
import Menu from 'components/menu';
import Async from 'components/async';
import metricsClient from 'clients/metrics';
import Select from 'components/select';
import Performance from './performance';
import Predictions from './predictions';
import Features from './features';
import DriftAnalysis from 'pages/templates/model-template/drift-analysis';

const Benchmarks = ({filtersStore, modelStore}) => {
    const [benchmarkFilters, setBenchmarkFilters] = useState();
    const mlModelIdFilter = filtersStore.filters.find((f) => f.left === 'model_id');
    const mlModelVersionFilter = filtersStore.filters.find((f) => f.left === 'model_version');
    const datasetIdFilter = filtersStore.filters.find((f) => f.left === 'dataset_id');
    const mlModelId = mlModelIdFilter?.right;
    const mlModelVersion = mlModelVersionFilter?.right;
    const datasetId = datasetIdFilter?.right;
    const model = modelStore.models.find((model) => model.mlModelId === mlModelId);

    // Remove all filters when navigating away.
    useEffect(() => () => {
        filtersStore.filters = [];
    }, []);

    useSyncStoresToUrl(({filtersStore, segmentationStore}) => ({
        filters: JSON.stringify(filtersStore.filters),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    if (!mlModelIdFilter || !mlModelVersionFilter) {

        return <Redirect to={{
            pathname: '/benchmark',
            search: '?'
        }}/>;
    }

    if (!model) {
        return `No model with id ${mlModelId}`;
    }

    const tabs = [
        {name: 'Performance Overview', to: '/benchmark/performance'}
    ];

    switch (model?.mlModelType) {
    case 'SPEECH_TO_TEXT':
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        break;
    case 'UNSUPERVISED_OBJECT_DETECTION':
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        tabs.push({name: 'Drift Analysis', to: '/benchmark/drift-analysis'});
        break;
    default:
        tabs.push({name: 'Prediction Analysis', to: '/benchmark/predictions'});
        tabs.push({name: 'Feature Analysis', to: '/benchmark/features'});
        break;
    }

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput/>
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
                <div className='px-3'>
                    <Route exact path='/benchmark/performance' render={() => {

                        return (
                            <Performance benchmarkFilters={benchmarkFilters}/>
                        );
                    }}/>
                    <Route exact path='/benchmark/predictions' component={Predictions}/>
                    <Route exact path='/benchmark/features' component={Features}/>
                    <Route exact path='/benchmark/drift-analysis' component={DriftAnalysis}/>
                </div>
            </Container>
        </Menu>
    );
};

Benchmarks.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(Benchmarks);
