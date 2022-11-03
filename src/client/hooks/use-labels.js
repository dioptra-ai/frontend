import {useEffect, useState} from 'react';
import {useInView} from 'react-intersection-observer';

import metricsClient from 'clients/metrics';

const useLabels = (datapoint) => {
    const {prediction, groundtruth} = datapoint;
    const {ref, inView} = useInView();
    const [requestPredictions, setRequestPredictions] = useState([]);
    const [requestGroundtruths, setRequestGroundtruths] = useState([]);
    const predictions = prediction ? [prediction] : requestPredictions;
    const groundtruths = groundtruth ? [groundtruth] : requestGroundtruths;

    useEffect(() => {
        if (inView && !prediction && !groundtruth && datapoint.request_id) {
            setRequestPredictions([]);
            setRequestGroundtruths([]);
            metricsClient('select', {
                select: '"prediction", "groundtruth", "tags"',
                filters: [{
                    left: 'request_id',
                    op: '=',
                    right: datapoint.request_id
                }, {
                    left: {
                        left: 'prediction',
                        op: 'is not null'
                    },
                    op: 'or',
                    right: {
                        left: 'groundtruth',
                        op: 'is not null'
                    }
                }]
            }).then((datapoints) => {
                setRequestPredictions(datapoints.map((d) => d.prediction).filter(Boolean));
                setRequestGroundtruths(datapoints.map((d) => d.groundtruth).filter(Boolean));
            });
        }
    }, [inView, datapoint.request_id]);

    return {ref, predictions, groundtruths};
};

export default useLabels;
