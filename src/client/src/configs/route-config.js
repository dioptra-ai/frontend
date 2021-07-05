import Login from '../pages/login';
import Models from '../pages/templates/models';
import Model from '../pages/templates/model-template/model';

export const Paths = (id) => (
    {
        HOME: '/home',
        LOGIN: '/login',
        MODELS: '/models',
        MODEL: '/models/:id',
        MODEL_PERFORMANCE_OVERVIEW: `/models/${id}/performance-overview`,
        MODEL_PERFORMANCE_DETAILS: `/models/${id}/performance-details`,
        MODEL_FEATURE_INTEGRITY: `/models/${id}/feature-integrity`,
        MODEL_INCIDENTS_AND_ALERTS: `/models/${id}/incidents-&-alerts`,
        EXPERIMENTATIONS: '/experimentations',
        ALERTS: '/alerts',
        SETTINGS: '/settings',
        PROFILE: '/profile'
    }
);

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
    {path: Paths().PROFILE, isExact: false}
];
