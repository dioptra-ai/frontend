import {useContext} from 'react';

import stores from 'state/stores';
import appContext from 'context/app-context';

const {timeStore} = stores;

const useTimeGranularity = (...args) => {
    const {isTimeEnabled} = useContext(appContext);

    if (isTimeEnabled) {

        return timeStore.getTimeGranularity(...args);
    } else {

        return null;
    }
};

export default useTimeGranularity;
