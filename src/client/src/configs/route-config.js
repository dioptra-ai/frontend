import Login from 'pages/login';
import Home from 'pages/home';
import Profile from 'pages/profile';
import Models from 'pages/templates/models';
import Model from 'pages/templates/model-template';
import Experimentations from 'pages/experimentations';
import Alerts from 'pages/alerts';
import Settings from 'pages/settings';

export const Paths = (args = {}) => {
    const {modelId = ':_id'} = args;

    return {
        HOME: '/home',
        LOGIN: '/login',
        MODELS: '/models',
        MODEL: `/models/${modelId}`,
        EXPERIMENTATIONS: '/benchmarks',
        ALERTS: '/alerts',
        SETTINGS: '/settings',
        PROFILE: '/profile'
    };
};

export const UnauthorizedRouteConfigs = [
    {path: Paths().LOGIN, isExact: true, component: Login}
];
export const AuthorizedRouteConfigs = [
    {path: Paths().HOME, isExact: true, component: Home},
    {path: Paths().MODELS, isExact: true, component: Models},
    {path: Paths().EXPERIMENTATIONS, isExact: true, component: Experimentations},
    {path: Paths().ALERTS, isExact: false, component: Alerts},
    {path: Paths().SETTINGS, isExact: false, component: Settings},
    {path: Paths().PROFILE, isExact: false, component: Profile}
];

export const getMatchingRouteConfig = (pathToMatch) => {
    const SLASH = '/';
    const allConfigs = [...AuthorizedRouteConfigs, ...UnauthorizedRouteConfigs];
    const pathToMatchParts = pathToMatch.split(SLASH);
    const matchingConfig = allConfigs.filter(({path}) => {
        const parts = path.split(SLASH);

        return (
            parts.length === pathToMatchParts.length &&
      parts.every(
          (part) => part.startsWith(':') || pathToMatchParts.indexOf(part) > -1
      )
        );
    });

    return matchingConfig && matchingConfig.length ? matchingConfig[0] : {};
};
