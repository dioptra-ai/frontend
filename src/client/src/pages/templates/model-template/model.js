import React, {useEffect} from 'react';
import GeneralSearchBar from '../general-search-bar';
import ModelDescription from '../../../components/model-description';
import Breadcrumb from '../../../components/breadcrumb';
import Tabs from '../../../components/tabs';
import {Route, useLocation, useParams} from 'react-router-dom';
import {ModelTabs, ModelTabsConfigs, getModelTab} from '../../../configs/model-config';
import Container from 'react-bootstrap/Container';
import {Paths} from '../../../configs/route-config';
import {renderComponent, setupComponent} from '../../../helpers/component-helper';
import PropTypes from 'prop-types';

const Model = ({modelStore}) => {
    const location = useLocation();
    const activeModelId = useParams().modelId;
    const model = modelStore.getModelById(activeModelId);

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

            {ModelTabsConfigs(activeModelId).map(({tab, component}) => (
                <Route
                    component={() => (
                        <Container fluid>
                            <Tabs
                                tabs={ModelTabs(activeModelId)}
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
    ) : 'Loading...';
};

Model.propTypes = {
    modelStore: PropTypes.object
};

export default setupComponent(Model);
