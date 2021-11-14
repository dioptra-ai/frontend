import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, useHistory, useParams} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import GeneralSearchBar from '../general-search-bar';
import AddAlertPage from 'pages/add-alert';
import ModelDescription from 'components/model-description';
import Breadcrumb from 'components/breadcrumb';
import Tabs from 'components/tabs';
import {setupComponent} from 'helpers/component-helper';
import PerformanceOverview from './performance-overview';
import PerformanceDetails from './performance-details';
import PredictionAnalysis from './prediction-analysis';
import FeatureAnalysis from './feature-analysis';
import IncidentsAndAlerts from './incidents-and-alerts.js';
import useModel from 'customHooks/use-model';
import StickyParamsRouter from 'components/sticky-params-router';

const Model = ({modelStore}) => {
    const mlModelId = useParams()._id;
    const model = useModel();

    const history = useHistory();

    useEffect(() => {
        modelStore.fetchModel(mlModelId);
    }, [mlModelId]);

    return model ? (
        <StickyParamsRouter
            basename='/models'
            getParamsFromStores={({timeStore, filtersStore, segmentationStore, iouStore}) => ({
                startTime: timeStore.start?.toISOString() || '',
                endTime: timeStore.end?.toISOString() || '',
                lastMs: timeStore.lastMs || '',
                filters: JSON.stringify(filtersStore.filters),
                mlModelVersion: filtersStore.mlModelVersion,
                segmentation: JSON.stringify(segmentationStore.segmentation),
                iou: JSON.stringify(iouStore.iou)
            })}
        >
            <Switch>
                <Route path={'/:id/add-alert'} component={AddAlertPage} exact/>
                <Route>
                    <GeneralSearchBar/>
                    <Breadcrumb links={[
                        {name: 'Models', path: () => history.push('/')},
                        {name: model.name, path: `/${mlModelId}/performance-overview`}
                    ]}/>
                    <ModelDescription {...model}/>
                    <Container fluid>
                        <Tabs tabs={[
                            {name: 'Performance Overview', to: `/${mlModelId}/performance-overview`},
                            {name: 'Performance Details', to: `/${mlModelId}/performance-details`},
                            {name: 'Prediction Analysis', to: `/${mlModelId}/prediction-analysis`},
                            {name: 'Feature Analysis', to: `/${mlModelId}/feature-analysis`},
                            {name: 'Incidents & Alerts', to: `/${mlModelId}/incidents-&-alerts`}
                        ]} />
                        <Route exact path='/:_id/performance-overview'
                            render={() => (
                                <div className='px-3'>
                                    <h2 className='text-dark bold-text fs-2 my-5'>Performance Overview</h2>
                                    <PerformanceOverview/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/performance-details'
                            render={() => (
                                <div className='px-3'>
                                    <h2 className='text-dark bold-text fs-2 my-5'>Performance Details</h2>
                                    <PerformanceDetails/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/prediction-analysis'
                            render={() => (
                                <div className='px-3'>
                                    <h2 className='text-dark bold-text fs-2 my-5'>Prediction Analysis</h2>
                                    <PredictionAnalysis/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/feature-analysis'
                            render={() => (
                                <div className='px-3'>
                                    <h2 className='text-dark bold-text fs-2 my-5'>Feature Analysis</h2>
                                    <FeatureAnalysis/>
                                </div>
                            )}
                        />
                        <Route exact path='/:_id/incidents-&-alerts'
                            render={() => (
                                <div className='px-3'>
                                    <h2 className='text-dark bold-text fs-2 my-5'>Incidents & Alerts</h2>
                                    <IncidentsAndAlerts/>
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
