import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {setupComponent} from 'helpers/component-helper';
import FilterInput from 'pages/common/filter-input';
import TopBar from 'pages/common/top-bar';
import AddAlertPage from 'pages/add-alert';
import ModelDescription from 'components/model-description';
import Tabs from 'components/tabs';
import Spinner from 'components/spinner';
import Performance from './performance';
import Features from './features';
import Explorer from './explorer';
import IncidentsAndAlerts from 'pages/common/incidents-and-alerts';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import Menu from 'components/menu';
import comparisonContext from 'context/comparison-context';
import {timeStore} from 'state/stores/time-store';
import useAllSqlFilters from 'hooks/use-all-sql-filters';
import metricsClient from 'clients/metrics';
import useAllFilters from 'hooks/use-all-filters';

const SplitView = ({children}) => children.length > 1 ? (
    <Row>
        {children.map((c, i) => (
            <comparisonContext.Provider value={{index: i, total: children.length}} key={i}>
                <Col xs={12 / children.length}>{c}</Col>
            </comparisonContext.Provider>
        ))}
    </Row>
) : (
    <comparisonContext.Provider value={{index: 0, total: children.length}}>
        {children}
    </comparisonContext.Provider>
);

SplitView.propTypes = {
    children: PropTypes.node.isRequired
};

const Model = ({filtersStore, modelStore}) => {
    const allSqlFiltersWithoutTime = useAllSqlFilters({excludeCurrentTimeFilters: true});
    const allFilters = useAllFilters();

    useSyncStoresToUrl(({timeStore, filtersStore, segmentationStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        models: JSON.stringify(filtersStore.models.map(({_id, mlModelId, mlModelVersion}) => ({_id, mlModelId, mlModelVersion}))),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    const models = filtersStore.models.map(({_id, mlModelId}) => {

        if (mlModelId) {

            return modelStore.getModelByMlModelId(mlModelId);
        } else {

            return modelStore.getModelById(_id);
        }
    });
    const tabs = [
        {name: 'Performance', to: '/models/performance'},
        {name: 'Features', to: '/models/features'},
        {name: 'Data Explorer', to: '/models/explorer'},
        {name: 'Incidents & Alerts', to: '/models/incidents-and-alerts'}
    ];
    const firstModel = models[0];

    useEffect(() => {
        (async () => {
            if (!timeStore.isModified) {
                const [c] = await metricsClient('throughput', {filters: allFilters});

                if (c?.value === 0) {
                    const [d] = await metricsClient('default-time-range', {
                        sql_filters: allSqlFiltersWithoutTime
                    }, false);

                    if (d) {
                        timeStore.setTimeRange(d);
                    }
                }
            }
        })();
    }, [timeStore.isModified, allSqlFiltersWithoutTime]);

    if (!firstModel) {

        return <Spinner/>;
    } else return (
        <Menu>
            <TopBar/>
            <SplitView>
                {models.map((model, i) => <ModelDescription key={i} {...model}/>)}
            </SplitView>
            <Container fluid>
                <Tabs tabs={tabs}/>
                <Switch>
                    <Route exact path='/models/add-alert' component={AddAlertPage}/>
                    <Route exact path='/models/edit-alert/:id' component={AddAlertPage}/>
                    <Route exact path='/models/incidents-and-alerts' component={IncidentsAndAlerts}/>
                    <Route>
                        <div className='m-3'>
                            <FilterInput
                                defaultFilters={filtersStore.filters}
                                onChange={(filters) => (filtersStore.filters = filters)}
                            />
                        </div>
                        <div className='px-3'>
                            <Route exact path='/models/performance' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <Performance key={i}/>)}
                                </SplitView>
                            )} />
                            <Route exact path='/models/features' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <Features key={i} />)}
                                </SplitView>
                            )} />
                            <Route path='/models/explorer' render={() => (
                                <BrowserRouter basename='/models/explorer'>
                                    <SplitView>
                                        {models.map((model, i) => <Explorer key={i}/>)}
                                    </SplitView>
                                </BrowserRouter>
                            )}/>
                        </div>
                    </Route>
                </Switch>
            </Container>
        </Menu>
    );
};

Model.propTypes = {
    filtersStore: PropTypes.object.isRequired,
    modelStore: PropTypes.object.isRequired
};

export default setupComponent(Model);
