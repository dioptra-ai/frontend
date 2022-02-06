import {useContext} from 'react';

import stores from 'state/stores';
import appContext from 'context/app-context';

const {timeStore} = stores;

const useTimeGranularity = (...args) => {
    const {isModelView} = useContext(appContext);

    if (isModelView) {

        return timeStore.getTimeGranularity(...args);
    } else {

        return null;
    }
};

export default useTimeGranularity;
