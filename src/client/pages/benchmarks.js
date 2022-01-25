import {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Redirect, Route} from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import GeneralSearchBar from './templates/general-search-bar';
import useSyncStoresToUrl from 'customHooks/use-sync-stores-to-url';
import Container from 'react-bootstrap/Container';
import Tabs from 'components/tabs';
import Menu from 'components/menu';
import PerformanceDetails from './templates/model-template/performance-details';
import PredictionAnalysis from './templates/model-template/prediction-analysis';
import FeatureAnalysis from './templates/model-template/feature-analysis';

const Benchmarks = ({filtersStore, modelStore}) => {
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
            pathname: '/benchmarks',
            search: '?'
        }}/>;
    }

    if (!model) {
        return `No model with id ${mlModelId}`;
    }

    const tabs = [
        {name: 'Performance Overview', to: '/benchmarks/performance'}
    ];

    if (model?.mlModelType !== 'Q_N_A') {
        tabs.push(
            {name: 'Prediction Analysis', to: '/benchmarks/predictions'}
        );

        tabs.push({name: 'Feature Analysis', to: '/benchmarks/features'});
    }

    return (
        <Menu>
            <GeneralSearchBar shouldShowOnlySearchInput/>
            <Container className='bg-white-blue text-secondary py-2' fluid>
                <Row className='align-items-center mt-3 px-3'>
                    <Col className='d-flex align-items-center'>
                        <h1 className='text-dark fs-2 m-0 bold-text'>{datasetId}</h1>
                    </Col>
                </Row>
                <Row className='align-items-center mb-3 px-3'>
                    <Col className='d-flex align-items-center'>
                        <h1 className='text-dark fs-3 m-0 bold-text'>{model.name}</h1>
                        <h3 className='text-secondary ms-3 fs-3'>{mlModelVersion}</h3>
                    </Col>
                </Row>
            </Container>
            <Container fluid>
                <Tabs tabs={tabs} />
                <div className='px-3'>
                    <Route exact path='/benchmarks/performance' component={PerformanceDetails}/>
                    <Route exact path='/benchmarks/predictions' component={PredictionAnalysis}/>
                    <Route exact path='/benchmarks/features' component={FeatureAnalysis}/>
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
