import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import FilterInput from 'pages/common/filter-input';
import GeneralSearchBar from 'pages/common/general-search-bar';
import AddAlertPage from 'pages/add-alert';
import ModelDescription from 'components/model-description';
import Tabs from 'components/tabs';
import {setupComponent} from 'helpers/component-helper';
import PerformanceOverview from './performance-overview';
import PerformanceDetails from './performance-details';
import PredictionAnalysis from './prediction-analysis';
import FeatureAnalysis from './feature-analysis';
import IncidentsAndAlerts from 'pages/common/incidents-and-alerts';
import TrafficReplay from 'pages/common/traffic-replay';
import useModel from 'hooks/use-model';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import Menu from 'components/menu';
import Spinner from 'components/spinner';

const Model = ({filtersStore}) => {
    const model = useModel();

    useSyncStoresToUrl(({timeStore, filtersStore, segmentationStore}) => ({
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

    if (model?.mlModelType !== 'UNSUPERVISED_OBJECT_DETECTION') {
        tabs.push({name: 'Performance Analysis', to: '/models/performance-details'});
    }

    if (model?.mlModelType !== 'Q_N_A') {
        tabs.push({name: 'Prediction Analysis', to: '/models/prediction-analysis'});
    }

    tabs.push({name: 'Feature Analysis', to: '/models/feature-analysis'});

    tabs.push({name: 'Traffic Replay', to: '/models/traffic-replay'});
    tabs.push({name: 'Incidents & Alerts', to: '/models/incidents-and-alerts'});

    return model ? (
        <Menu>
            <GeneralSearchBar/>
            <ModelDescription {...model}/>
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
                            <Route exact path='/models/performance-overview' component={PerformanceOverview}/>
                            <Route exact path='/models/performance-details' component={PerformanceDetails}/>
                            <Route exact path='/models/prediction-analysis' component={PredictionAnalysis}/>
                            <Route exact path='/models/feature-analysis' component={FeatureAnalysis}/>
                            <Route exact path='/models/traffic-replay' component={TrafficReplay}/>
                        </div>
                    </Route>
                </Switch>
            </Container>
        </Menu>
    ) : <Spinner/>;
};

Model.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(Model);
