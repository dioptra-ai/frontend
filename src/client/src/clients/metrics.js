import baseJSONClient from 'clients/base-json-client';
// import mem from 'mem';
// import {memoizedFetch} from './base-json-client';


const metricsClient = (path, body, method = 'get', headers = {'content-type': 'application/json'}) => {
    console.log('path + body: ');
    console.log(path);
    console.log(body);
    if (path === '/compute') {
        if (body.metrics_type === 'map_mar') {
            return baseJSONClient(`/api/metrics/${path}`, { //baseJSONClient uses memoization logic when memoization=true
                method, headers,
                body: JSON.stringify(body),
                memoized: true
            });
        }

    }

    return baseJSONClient(`/api/metrics/${path}`, {
        method: 'POST',
        body
    });
};

export default metricsClient;
