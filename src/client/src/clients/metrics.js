import baseJSONClient from 'clients/base-json-client';
// import mem from 'mem';
// import {memoizedFetch} from './base-json-client';


const metricsClient = (path, body, method = 'get', headers = {'content-type': 'application/json'}) => {

    return baseJSONClient(`/api/metrics/${path}`, { //baseJSONClient uses memoization logic when memoization=true
        method, headers,
        body: JSON.stringify(body),
        memoized: true
    });

    // return baseJSONClient(`/api/metrics/${path}`, {
    //     method: 'POST',
    //     body,
    //     memoized: true
    // });
};

export default metricsClient;
