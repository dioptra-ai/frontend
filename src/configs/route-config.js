import Login from '../pages/login';
import {Paths} from '../constants';
import Models from '../pages/templates/models';
import Model from '../pages/templates/model-template/model';

export const UnauthorizedRouteConfigs = [
    {path: Paths.LOGIN, isExact: true, component: Login}
];
export const AuthorizedRouteConfigs = [
    {path: Paths.HOME, isExact: true},
    {path: Paths.MODELS, isExact: true, component: Models},
    {path: Paths.MODEL, isExact: false, component: Model},
    {path: Paths.EXPERIMENTATIONS, isExact: false},
    {path: Paths.ALERTS, isExact: false},
    {path: Paths.SETTINGS, isExact: false},
    {path: Paths.PROFILE, isExact: false}
];
