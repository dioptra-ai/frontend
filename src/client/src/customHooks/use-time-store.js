import {useEffect} from 'react';

import stores from 'state/stores';

const useTimeStore = (use = true) => {

    useEffect(() => {
        stores.timeStore.setEnabled(use);
    });
};

export default useTimeStore;
