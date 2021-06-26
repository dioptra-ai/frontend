import Login from '../pages/login';
import {Paths} from '../constants';

export const UnauthorizedRouteConfigs = [
    {path: Paths.LOGIN, isExact: true, component: Login}
];
export const AuthorizedRouteConfigs = [
    {path: Paths.HOME, isExact: true},
    {path: Paths.MODELS, isExact: false},
    {path: Paths.EXPERIMENTATIONS, isExact: false},
    {path: Paths.ALERTS, isExact: false},
    {path: Paths.SETTINGS, isExact: false},
    {path: Paths.PROFILE, isExact: false}
];
