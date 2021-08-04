import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Route, useLocation, useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import GeneralSearchBar from '../general-search-bar';
import ModelDescription from 'components/model-description';
import Breadcrumb from 'components/breadcrumb';
import Tabs from 'components/tabs';
import {Paths} from 'configs/route-config';
import {setupComponent} from 'helpers/component-helper';
import PerformanceOverview from './performance-overview';
import PerformanceDetails from './performance-details';
import PredictionAnalysis from './prediction-analysis';
import FeatureAnalysis from './feature-analysis';
import IncidentsAndAlerts from './incidents-and-alerts.js';
import useModel from 'customHooks/use-model';

export const ModelTabNames = {
    PERFORMANCE_OVERVIEW: 'Performance Overview',
    PERFORMANCE_DETAILS: 'Performance Details',
    PREDICTION_ANALYSIS: 'Prediction Analysis',
    FEATURE_ANALYSIS: 'Feature Analysis',
    INCIDENTS_AND_ALERTS: 'Incidents & Alerts'
};
export const ModelTabs = (modelId) => (
    [
        {name: ModelTabNames.PERFORMANCE_OVERVIEW, path: Paths({modelId}).MODEL_PERFORMANCE_OVERVIEW},
        {name: ModelTabNames.PERFORMANCE_DETAILS, path: Paths({modelId}).MODEL_PERFORMANCE_DETAILS},
        {name: ModelTabNames.PREDICTION_ANALYSIS, path: Paths({modelId}).MODEL_PREDICTION_ANALYSIS},
        {name: ModelTabNames.FEATURE_ANALYSIS, path: Paths({modelId}).MODEL_FEATURE_ANALYSIS},
        {name: ModelTabNames.INCIDENTS_AND_ALERTS, path: Paths({modelId}).MODEL_INCIDENTS_AND_ALERTS}
    ]
);

export const getModelTab = (id, pathname) => {
    const tab = ModelTabs(id).find((tab) => pathname.includes(tab.path));

    return tab;
};

export const ModelTabsConfigs = (id) => (
    [
        {tab: ModelTabs(id)[0], TabComponent: PerformanceOverview},
        {tab: ModelTabs(id)[1], TabComponent: PerformanceDetails},
        {tab: ModelTabs(id)[2], TabComponent: PredictionAnalysis},
        {tab: ModelTabs(id)[3], TabComponent: FeatureAnalysis},
        {tab: ModelTabs(id)[4], TabComponent: IncidentsAndAlerts}
    ]
);

const Model = ({modelStore}) => {
    const location = useLocation();
    const activeModelId = useParams()._id;
    const model = useModel();

    useEffect(() => {
        modelStore.fetchModel(activeModelId);
    }, [activeModelId]);

    return model ? (
        <>
            <GeneralSearchBar/>
            <Breadcrumb links={[
                {name: 'Models', path: Paths().MODELS},
                {name: model.name, path: Paths(activeModelId).MODEL_PERFORMANCE_OVERVIEW},
                {...getModelTab(activeModelId, location.pathname)}
            ]}/>
            <ModelDescription {...model}/>

            {ModelTabsConfigs().map(({tab, TabComponent}) => (
                <Route
                    component={() => (
                        <Container fluid>
                            <Tabs
                                tabs={ModelTabs(activeModelId)}
                            />
                            <div className='px-3'>
                                <h2 className='text-dark bold-text fs-2 my-5'>{tab.name}</h2>
                                <TabComponent model={model}/>
                            </div>
                        </Container>)}
                    exact
                    key={tab.path}
                    path={tab.path}
                />
            ))}
        </>
    ) : 'Loading...';
};

Model.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Model);
