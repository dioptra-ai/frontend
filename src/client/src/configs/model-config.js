import {ModelTabNames} from '../constants';
import {Paths} from './route-config';
import PerformanceOverview from '../pages/templates/model-template/performance-overview';
import PerformanceDetails from '../pages/templates/model-template/performance-details';
import FeatureIntegrityTable from '../pages/templates/model-template/feature-integrity';
import IncidentsAndAlerts from '../pages/templates/model-template/incidents-and-alerts';
import PredictionAnalysis from '../pages/templates/model-template/prediction-analysis';


export const ModelTabs = (id) => (
    [
        {name: ModelTabNames.PERFORMANCE_OVERVIEW, path: Paths(id).MODEL_PERFORMANCE_OVERVIEW},
        {name: ModelTabNames.PERFORMANCE_DETAILS, path: Paths(id).MODEL_PERFORMANCE_DETAILS},
        {name: ModelTabNames.PREDICTION_ANALYSIS, path: Paths(id).MODEL_PREDICTION_ANALYSIS},
        {name: ModelTabNames.FEATURE_ANALYSIS, path: Paths(id).MODEL_FEATURE_ANALYSIS},
        {name: ModelTabNames.INCIDENTS_AND_ALERTS, path: Paths(id).MODEL_INCIDENTS_AND_ALERTS}
    ]
);

export const getModelTab = (id, pathname) => {
    const tab = ModelTabs(id).find((tab) => pathname.includes(tab.path));

    return tab;
};

export const ModelTabsConfigs = (id) => (
    [
        {tab: ModelTabs(id)[0], TabComponent: PerformanceOverview},
        {tab: ModelTabs(id)[1], TabComponent: PerformanceDetails},
        {tab: ModelTabs(id)[2], TabComponent: PredictionAnalysis},
        {tab: ModelTabs(id)[3], TabComponent: FeatureIntegrityTable},
        {tab: ModelTabs(id)[4], TabComponent: IncidentsAndAlerts}
    ]
);
