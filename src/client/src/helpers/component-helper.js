import {inject, observer} from 'mobx-react';
import state from '../state/stores/initializer';

export const setupComponent = (c) => inject(() => state)(observer(c));

export const renderComponent = (c) => c && c.render();
