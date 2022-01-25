import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, useHistory, useParams, useRouteMatch} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import url from 'url';

import GeneralSearchBar from '../general-search-bar';
import AddAlertPage from 'pages/add-alert';
import ModelDescription from 'components/model-description';
import Tabs from 'components/tabs';
import {setupComponent} from 'helpers/component-helper';
import PerformanceOverview from './performance-overview';
import PerformanceDetails from './performance-details';
import PredictionAnalysis from './prediction-analysis';
import FeatureAnalysis from './feature-analysis';
import IncidentsAndAlerts from './incidents-and-alerts';
import TrafficReplay from './traffic-replay';
import useModel from 'customHooks/use-model';
import StickyParamsRouter from 'components/sticky-params-router';
import Select from 'components/select';

const Model = ({modelStore}) => {
    const modelId = useParams()._id;
    const model = useModel();
    const history = useHistory();
    const routeMatch = useRouteMatch('/models/:_id/:tabPath');

    useEffect(() => {
        // All models needed for the breadcrumb selector
        modelStore.fetchModels();
    }, [modelId]);

    const tabs = [
        {name: 'Performance Overview', to: `/${modelId}/performance-overview`}
    ];

    if (model?.mlModelType !== 'UNSUPERVISED_OBJECT_DETECTION') {
        tabs.push(
            {name: 'Performance Analysis', to: `/${modelId}/performance-details`}
        );
    }

    if (model?.mlModelType !== 'Q_N_A') {
        tabs.push(
            {name: 'Prediction Analysis', to: `/${modelId}/prediction-analysis`}
        );

        tabs.push({name: 'Feature Analysis', to: `/${modelId}/feature-analysis`});
    }

    tabs.push({name: 'Traffic Replay', to: `/${modelId}/traffic-replay`});
    tabs.push({name: 'Incidents & Alerts', to: `/${modelId}/incidents-&-alerts`});

    return model ? (
        <StickyParamsRouter
            basename='/models'
            getParamsFromStores={({timeStore, filtersStore, segmentationStore}) => ({
                startTime: timeStore.start?.toISOString() || '',
                endTime: timeStore.end?.toISOString() || '',
                lastMs: timeStore.lastMs || '',
                filters: JSON.stringify(filtersStore.filters),
                mlModelVersion: filtersStore.mlModelVersion,
                segmentation: JSON.stringify(segmentationStore.segmentation)
            })}
        >
            <Switch>
                <Route path={'/:id/add-alert'} component={AddAlertPage} exact/>
                <Route>
                    <GeneralSearchBar/>
                    <Container className='bg-white-blue text-secondary py-2' fluid>
                        <div className='breadcrumb m-0 px-3'>
                            <span className='link'>
                                <a
                                    className='text-secondary bold-text fs-6'
                                    onClick={() => history.push('/')}
                                >
                                    Models
                                </a>
                            </span>
                            <span className='link'>
                                <div
                                    className='text-secondary bold-text fs-6'
                                >
                                    <Select
                                        padding={0}
                                        borderColor='transparent'
                                        onChange={(value) => {
                                            const destination = url.format({
                                                pathname: `/models/${value}/${routeMatch.params.tabPath}`,
                                                search: window.location.search
                                            });

                                            window.location.assign(destination);
                                        }}
                                        options={modelStore.models.map((m) => ({
                                            name: m.name,
                                            value: m._id
                                        }))}
                                        initialValue={modelId}
                                    />
                                </div>
                            </span>
                        </div>
                    </Container>
                    <ModelDescription {...model}/>
                    <Container fluid>
                        <Tabs tabs={tabs} />
                        <Route exact path='/:_id/performance-overview'
                            render={() => (
                                <div className='px-3'>
                                    <PerformanceOverview/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/performance-details'
                            render={() => (
                                <div className='px-3'>
                                    <PerformanceDetails/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/prediction-analysis'
                            render={() => (
                                <div className='px-3'>
                                    <PredictionAnalysis/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/feature-analysis'
                            render={() => (
                                <div className='px-3'>
                                    <FeatureAnalysis/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/incidents-&-alerts'
                            render={() => (
                                <div className='px-3'>
                                    <IncidentsAndAlerts/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/traffic-replay'
                            render={() => (
                                <div className='px-3'>
                                    <TrafficReplay/>
                                </div>
                            )}
                        />
                    </Container>
                </Route>
            </Switch>
        </StickyParamsRouter>
    ) : 'Loading...';
};

Model.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Model);
