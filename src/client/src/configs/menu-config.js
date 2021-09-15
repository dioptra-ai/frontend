import {IconNames} from '../constants';
import {Paths} from './route-config';

export const TopMenuItemsConfig = [
    {icon: IconNames.HOME, url: Paths().HOME, comingSoon: true},
    {icon: IconNames.MODELS, url: Paths().MODELS},
    {icon: IconNames.EXPERIMENTATIONS, url: Paths().EXPERIMENTATIONS, comingSoon: true},
    {icon: IconNames.ALERTS_BELL, url: Paths().ALERTS, comingSoon: true}
];

export const BottomMenuItemsConfig = [
    {icon: IconNames.SETTING, url: Paths().SETTINGS},
    {icon: IconNames.USER, url: Paths().PROFILE}
];
