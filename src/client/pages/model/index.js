import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'pages/common/filter-input';
import GeneralSearchBar from 'pages/common/general-search-bar';
import AddAlertPage from 'pages/add-alert';
import ModelDescription from 'components/model-description';
import Tabs from 'components/tabs';
import PerformanceOverview from './performance-overview';
import PerformanceDetails from './performance-details';
import PredictionAnalysis from './prediction-analysis';
import FeatureAnalysis from './feature-analysis';
import IncidentsAndAlerts from 'pages/common/incidents-and-alerts';
import TrafficReplay from 'pages/common/traffic-replay';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import Menu from 'components/menu';
import Spinner from 'components/spinner';
import comparisonContext from 'context/comparison-context';

const SplitView = ({children}) => (
    <Row>
        {children.map((c, i) => (
            <comparisonContext.Provider value={{index: i, total: children.length}} key={i}>
                <Col xs={12 / children.length}>{c}</Col>
            </comparisonContext.Provider>
        ))}
    </Row>
);

SplitView.propTypes = {
    children: PropTypes.node.isRequired
};

const Model = ({timeStore, filtersStore, modelStore}) => {
    const models = filtersStore.models.map(({_id}) => {

        return modelStore.getModelById(_id);
    });
    const firstModel = models[0];

    useSyncStoresToUrl(({filtersStore, segmentationStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        models: JSON.stringify(filtersStore.models.map(({_id, mlModelId, mlModelVersion}) => ({_id, mlModelId, mlModelVersion}))),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    const tabs = [
        {name: 'Performance Overview', to: '/models/performance-overview'}
    ];

    if (firstModel?.mlModelType !== 'UNSUPERVISED_OBJECT_DETECTION') {
        tabs.push({name: 'Performance Analysis', to: '/models/performance-details'});
    }

    if (firstModel?.mlModelType !== 'Q_N_A') {
        tabs.push({name: 'Prediction Analysis', to: '/models/prediction-analysis'});
    }

    tabs.push({name: 'Feature Analysis', to: '/models/feature-analysis'});

    tabs.push({name: 'Traffic Replay', to: '/models/traffic-replay'});
    tabs.push({name: 'Incidents & Alerts', to: '/models/incidents-and-alerts'});

    return firstModel ? (
        <Menu>
            <GeneralSearchBar/>
            <SplitView>
                {models.map((model, i) => <ModelDescription key={i} {...model}/>)}
            </SplitView>
            <Container fluid>
                <Tabs tabs={tabs}/>
                <Switch>
                    <Route exact path='/models/add-alert' component={AddAlertPage}/>
                    <Route exact path='/models/incidents-and-alerts' component={IncidentsAndAlerts}/>
                    <Route>
                        <FilterInput
                            defaultFilters={filtersStore.filters}
                            onChange={(filters) => (filtersStore.filters = filters)}
                        />
                        <div className='px-3'>
                            <Route exact path='/models/performance-overview' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <PerformanceOverview key={i}/>)}
                                </SplitView>
                            )}/>
                            <Route exact path='/models/performance-details' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <PerformanceDetails key={i}/>)}
                                </SplitView>
                            )}/>
                            <Route exact path='/models/prediction-analysis' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <PredictionAnalysis key={i}/>)}
                                </SplitView>
                            )}/>
                            <Route exact path='/models/feature-analysis' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <FeatureAnalysis key={i}/>)}
                                </SplitView>
                            )}/>
                            <Route exact path='/models/traffic-replay' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <TrafficReplay key={i}/>)}
                                </SplitView>
                            )}/>
                        </div>
                    </Route>
                </Switch>
            </Container>
        </Menu>
    ) : <Spinner/>;
};

Model.propTypes = {
    timeStore: PropTypes.object.isRequired,
    filtersStore: PropTypes.object.isRequired,
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(Model);
