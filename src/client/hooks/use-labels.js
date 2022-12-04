import {useEffect, useRef, useState} from 'react';
import {useInView} from 'react-intersection-observer';

import metricsClient from 'clients/metrics';

const useLabels = (datapoint) => {
    const {prediction, groundtruth} = datapoint;
    const {ref, inView} = useInView();
    const [requestPredictions, setRequestPredictions] = useState([]);
    const [requestGroundtruths, setRequestGroundtruths] = useState([]);
    const predictions = prediction ? [prediction] : requestPredictions;
    const groundtruths = groundtruth ? [groundtruth] : requestGroundtruths;
    const requestControllerRef = useRef();

    useEffect(() => {
        if (!prediction && !groundtruth && datapoint.request_id) {
            if (requestControllerRef.current) {
                requestControllerRef.current.abort();
            }

            if (inView) {
                setRequestPredictions([]);
                setRequestGroundtruths([]);
                requestControllerRef.current = new AbortController();

                // TODO: Only display labels for datapoint rows, not label rows.
                (async () => {
                    try {
                        let datapoints = await metricsClient('select', {
                            select: '"prediction", "groundtruth", "tags"',
                            filters: [{
                                left: 'uuid',
                                op: '=',
                                right: datapoint.uuid
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
                        }, true, {signal: requestControllerRef.current.signal});

                        if (!datapoints.length) {
                            datapoints = await metricsClient('select', {
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
                            }, true, {signal: requestControllerRef.current.signal});
                        }

                        setRequestPredictions(datapoints.map((d) => d.prediction).filter(Boolean));
                        setRequestGroundtruths(datapoints.map((d) => d.groundtruth).filter(Boolean));
                    } catch (err) {

                        if (err.name !== 'AbortError') {
                            console.error(err);
                        }
                    }
                })();
            }
        }
    }, [inView, datapoint]);

    return {ref, predictions, groundtruths};
};

export default useLabels;
