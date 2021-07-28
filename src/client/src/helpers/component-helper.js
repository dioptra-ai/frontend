import {inject, observer} from 'mobx-react';
import state from 'state/stores';

export const setupComponent = (c) => inject(() => state)(observer(c));
