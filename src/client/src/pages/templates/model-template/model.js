import React from 'react';
import GeneralSearchBar from '../general-search-bar';
import ModelDescription from '../../../components/model-description';
import Breadcrumb from '../../../components/breadcrumb';
import Tabs from '../../../components/tabs';
import {Route, useLocation} from 'react-router-dom';
import {ModelTabs, ModelTabsConfigs, getModelTab} from '../../../configs/model-config';
import Container from 'react-bootstrap/Container';
import {Paths} from '../../../configs/route-config';

const model = {
    id: 1,
    name: 'Credit Card Transaction Fraud Detection',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum sem eget convallis malesuada. Quisque accumsan nisi ut ipsum tincidunt, a posuere nisi viverra. Quisque a lorem tellus.',
    deployed: 'May 5th, 2021 at 18:30',
    incidents: 4,
    owner: 'GG Team',
    tier: 5,
    version: 'V 1.01'
};

const Model = () => {
    const location = useLocation();

    return (
        <>
            <GeneralSearchBar/>
            <Breadcrumb links={[
                {name: 'Models', path: Paths().MODELS},
                {name: model.name, path: Paths(model.id).MODEL_PERFORMANCE_OVERVIEW},
                {...getModelTab(model.id, location.pathname)}
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

            {ModelTabsConfigs(model.id).map(({tab, component}) => (
                <Route
                    component={() => (
                        <Container fluid>
                            <Tabs
                                tabs={ModelTabs(model.id)}
                            />
                            <div className='px-3'>
                                <h2 className='text-dark fw-bold fs-2 my-5'>{tab.name}</h2>
                                {component && component()}
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

export default Model;
