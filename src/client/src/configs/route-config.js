import Login from 'pages/login';
import Models from 'pages/templates/models';
import Model from 'pages/templates/model-template';
import AddAlertPage from 'pages/add-alert';

export const Paths = (args = {}) => {
    const {modelId = ':_id'} = args;

    return {
        HOME: '/home',
        LOGIN: '/login',
        MODELS: '/models',
        MODEL: `/models/${modelId}`,
        MODEL_PERFORMANCE_OVERVIEW: `/models/${modelId}/performance-overview`,
        MODEL_PERFORMANCE_DETAILS: `/models/${modelId}/performance-details`,
        MODEL_PREDICTION_ANALYSIS: `/models/${modelId}/prediction-analysis`,
        MODEL_FEATURE_ANALYSIS: `/models/${modelId}/feature-analysis`,
        MODEL_INCIDENTS_AND_ALERTS: `/models/${modelId}/incidents-&-alerts`,
        ADD_ALERT: '/add-alert',
        EXPERIMENTATIONS: '/experimentations',
        ALERTS: '/alerts',
        SETTINGS: '/settings',
        PROFILE: '/profile'
    };
};

export const UnauthorizedRouteConfigs = [
    {path: Paths().LOGIN, isExact: true, component: Login}
];
export const AuthorizedRouteConfigs = [
    {path: Paths().HOME, isExact: true},
    {path: Paths().MODELS, isExact: true, component: Models},
    {path: Paths().MODEL, isExact: false, component: Model},
    {path: Paths().EXPERIMENTATIONS, isExact: false},
    {path: Paths().ALERTS, isExact: false},
    {path: Paths().SETTINGS, isExact: false},
    {path: Paths().PROFILE, isExact: false},
    {path: Paths().ADD_ALERT, isExact: true, component: AddAlertPage, menuMatch: Paths().MODELS}
];

export const getMatchingRouteConfig = (pathToMatch) => {
    const SLASH = '/';
    const allConfigs = [...AuthorizedRouteConfigs, ...UnauthorizedRouteConfigs];
    const pathToMatchParts = pathToMatch.split(SLASH);
    const matchingConfig = allConfigs.filter(({path}) => {
        const parts = path.split(SLASH);

        return parts.length === pathToMatchParts.length &&
          parts.every((part) => part.startsWith(':') || pathToMatchParts.indexOf(part) > -1);
    });

    return matchingConfig && matchingConfig.length ? matchingConfig[0] : {};
};
