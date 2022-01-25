import {useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';

import stores from 'state/stores';

const useSyncStoresToUrl = (getParamsFromStores) => {
    const history = useHistory();
    const location = useLocation();
    const paramsFromStores = getParamsFromStores(stores);

    useEffect(() => {

        history.replace({
            search: `?${new URLSearchParams(paramsFromStores).toString()}`
        });
    }, [JSON.stringify(paramsFromStores), location.pathname]);
};

export default useSyncStoresToUrl;
