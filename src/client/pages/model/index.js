import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import FilterInput from 'components/filter-input';
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

const Model = ({filtersStore}) => {
    const modelId = useParams()._id;
    const model = useModel();

    useSyncStoresToUrl(({timeStore, filtersStore, segmentationStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        mlModelVersion: filtersStore.mlModelVersion,
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    const tabs = [
        {name: 'Performance Overview', to: `/models/${modelId}/performance-overview`}
    ];

    if (model?.mlModelType !== 'UNSUPERVISED_OBJECT_DETECTION') {
        tabs.push(
            {name: 'Performance Analysis', to: `/models/${modelId}/performance-details`}
        );
    }

    if (model?.mlModelType !== 'Q_N_A') {
        tabs.push(
            {name: 'Prediction Analysis', to: `/models/${modelId}/prediction-analysis`}
        );

        tabs.push({name: 'Feature Analysis', to: `/models/${modelId}/feature-analysis`});
    }

    tabs.push({name: 'Traffic Replay', to: `/models/${modelId}/traffic-replay`});
    tabs.push({name: 'Incidents & Alerts', to: `/models/${modelId}/incidents-and-alerts`});

    return model ? (
        <Menu>
            <Switch>
                <Route path={'/models/:_id/add-alert'} component={AddAlertPage} exact/>
                <Route>
                    <GeneralSearchBar/>
                    <ModelDescription {...model}/>
                    <Container fluid>
                        <Tabs tabs={tabs} />

                        <FilterInput
                            defaultFilters={filtersStore.filters}
                            onChange={(filters) => (filtersStore.filters = filters)}
                        />
                        <div className='px-3'>
                            <Route exact
                                path='/models/:_id/performance-overview'
                                component={PerformanceOverview}/>
                            <Route exact
                                path='/models/:_id/performance-details'
                                component={PerformanceDetails}/>
                            <Route exact
                                path='/models/:_id/prediction-analysis'
                                component={PredictionAnalysis}/>
                            <Route exact
                                path='/models/:_id/feature-analysis'
                                component={FeatureAnalysis}/>
                            <Route exact
                                path='/models/:_id/incidents-and-alerts'
                                component={IncidentsAndAlerts}/>
                            <Route exact
                                path='/models/:_id/traffic-replay'
                                component={TrafficReplay}/>
                        </div>
                    </Container>
                </Route>
            </Switch>
        </Menu>
    ) : 'Loading...';
};

Model.propTypes = {
    filtersStore: PropTypes.object.isRequired
};

export default setupComponent(Model);
