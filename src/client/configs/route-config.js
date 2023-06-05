import Login from 'pages/login';
import Home from 'pages/home';
import Profile from 'pages/profile';
import BenchmarksList from 'pages/benchmarks-list';
import Alerts from 'pages/alerts';
import Settings from 'pages/settings';

export const Paths = () => {

    return {
        HOME: '/home',
        LOGIN: '/login',
        EXPERIMENTATIONS: '/benchmark',
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
    {path: Paths().EXPERIMENTATIONS, isExact: true, component: BenchmarksList},
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
