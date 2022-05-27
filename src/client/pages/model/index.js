import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
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
import EmbeddingSpace from './embedding-space';
import IncidentsAndAlerts from 'pages/common/incidents-and-alerts';
import useSyncStoresToUrl from 'hooks/use-sync-stores-to-url';
import Menu from 'components/menu';
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

const Model = ({filtersStore, modelStore}) => {

    useSyncStoresToUrl(({timeStore, filtersStore, segmentationStore}) => ({
        startTime: timeStore.start?.toISOString() || '',
        endTime: timeStore.end?.toISOString() || '',
        lastMs: timeStore.lastMs || '',
        filters: JSON.stringify(filtersStore.filters),
        models: JSON.stringify(filtersStore.models.map(({_id, mlModelId, mlModelVersion}) => ({_id, mlModelId, mlModelVersion}))),
        segmentation: JSON.stringify(segmentationStore.segmentation)
    }));

    const models = filtersStore.models.map(({_id}) => {

        return modelStore.getModelById(_id);
    });
    const firstModel = models[0];
    const tabs = [
        {name: 'Performance', to: '/models/performance'},
        {name: 'Embedding Space', to: '/models/embedding-space'},
        {name: 'Incidents & Alerts', to: '/models/incidents-and-alerts'}
    ];

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
                        <FilterInput
                            defaultFilters={filtersStore.filters}
                            onChange={(filters) => (filtersStore.filters = filters)}
                        />
                        <div className='px-3'>
                            <Route exact path='/models/performance' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <Performance key={i}/>)}
                                </SplitView>
                            )}/>
                            <Route exact path='/models/embedding-space' render={() => (
                                <SplitView>
                                    {models.map((model, i) => <EmbeddingSpace key={i}/>)}
                                </SplitView>
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
