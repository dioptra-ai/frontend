import PerformanceOverview from '../pages/templates/model-template/performance-overview';
import PerformanceDetails from '../pages/templates/model-template/performance-details';
import FeatureIntegrity from '../pages/templates/model-template/feature-integrity';
import IncidentsAndAlerts from '../pages/templates/model-template/incidents-and-alerts';

export const ModelTabs = (id) => (
    [
        {name: 'Performance Overview', path: `/models/${id}/performance-overview`},
        {name: 'Performance Details', path: `/models/${id}/performance-details`},
        {name: 'Feature Integrity', path: `/models/${id}/feature-integrity`},
        {name: 'Incidents & Alerts', path: `/models/${id}/incidents-&-alerts`}
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
