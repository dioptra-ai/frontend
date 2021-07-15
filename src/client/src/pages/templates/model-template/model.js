import React from 'react';
import GeneralSearchBar from '../general-search-bar';
import ModelDescription from '../../../components/model-description';
import Breadcrumb from '../../../components/breadcrumb';
import Tabs from '../../../components/tabs';
import {Route, useLocation} from 'react-router-dom';
import {ModelTabs, ModelTabsConfigs, getModelTab} from '../../../configs/model-config';
import Container from 'react-bootstrap/Container';
import {Paths} from '../../../configs/route-config';
import {renderComponent, setupComponent} from '../../../helpers/component-helper';
import PropTypes from 'prop-types';

const Model = ({modelStore}) => {
    const location = useLocation();
    const model = modelStore.activeModel;

    return (
        <>
            <GeneralSearchBar/>
            <Breadcrumb links={[
                {name: 'Models', path: Paths().MODELS},
                {name: model.name, path: Paths(model.mlModelId).MODEL_PERFORMANCE_OVERVIEW},
                {...getModelTab(model.mlModelId, location.pathname)}
            ]}/>
            <ModelDescription
                deployed={model.deployed}
                description={model.description}
                incidents={model.incidents}
                owner={model.owner}
                tier={model.tier}
                title={model.name}
                version={model.version}
            />

            {ModelTabsConfigs(model.mlModelId).map(({tab, component}) => (
                <Route
                    component={() => (
                        <Container fluid>
                            <Tabs
                                tabs={ModelTabs(model.mlModelId)}
                            />
                            <div className='px-3'>
                                <h2 className='text-dark fw-bold fs-2 my-5'>{tab.name}</h2>
                                 {renderComponent(component)}
                            </div>
                        </Container>)}
                    exact
                    key={tab.path}
                    path={tab.path}
                />
            ))}
        </>
    );
};

Model.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Model);
