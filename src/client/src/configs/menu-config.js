import {IconNames} from '../constants';
import {Paths} from './route-config';

export const TopMenuItemsConfig = [
    {icon: IconNames.HOME, url: Paths().HOME, comingSoon: true, title: 'Home'},
    {icon: IconNames.MODELS, url: Paths().MODELS, title: 'Models'},
    {icon: IconNames.EXPERIMENTATIONS, url: Paths().EXPERIMENTATIONS, comingSoon: true, title: 'Experimentations'},
    {icon: IconNames.ALERTS_BELL, url: Paths().ALERTS, comingSoon: true, title: 'Alerts'}
];

export const BottomMenuItemsConfig = [
    {icon: IconNames.SETTING, url: Paths().SETTINGS, title: 'Settings'},
    {icon: IconNames.USER, url: Paths().PROFILE, title: 'User'}
];
