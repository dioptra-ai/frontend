import {ModelTabNames} from '../constants';
import {Paths} from './route-config';
import PerformanceOverview from '../pages/templates/model-template/performance-overview';
import PerformanceDetails from '../pages/templates/model-template/performance-details';
import FeatureIntegrity from '../pages/templates/model-template/feature-integrity';
import IncidentsAndAlerts from '../pages/templates/model-template/incidents-and-alerts';

export const ModelTabs = (id) => (
    [
        {name: ModelTabNames.PERFORMANCE_OVERVIEW, path: Paths(id).MODEL_PERFORMANCE_OVERVIEW},
        {name: ModelTabNames.PERFORMANCE_DETAILS, path: Paths(id).MODEL_PERFORMANCE_DETAILS},
        {name: ModelTabNames.FEATURE_INTEGRITY, path: Paths(id).MODEL_FEATURE_INTEGRITY},
        {name: ModelTabNames.INCIDENTS_AND_ALERTS, path: Paths(id).MODEL_INCIDENTS_AND_ALERTS}
    ]
);

export const getModelTab = (id, pathname) => {
    const tab = ModelTabs(id).find((tab) => pathname.includes(tab.path));

    return tab;
};

export const ModelTabsConfigs = (id) => (
    [
        {tab: ModelTabs(id)[0], component: PerformanceOverview},
        {tab: ModelTabs(id)[1], component: PerformanceDetails},
        {tab: ModelTabs(id)[2], component: FeatureIntegrity},
        {tab: ModelTabs(id)[3], component: IncidentsAndAlerts}
    ]
);
