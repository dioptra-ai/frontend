import {useParams} from 'react-router-dom';

import stores from 'state/stores';

const {modelStore} = stores;

const useModel = () => {

    const currentModelId = useParams()._id;

    return modelStore.getModelById(currentModelId);
};

export default useModel;
