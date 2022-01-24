import baseJSONClient from 'clients/base-json-client';

const metricsClient = (path, body, method = 'post', headers = {'content-type': 'application/json'}) => {

    return baseJSONClient(`/api/metrics/${path}`, { //baseJSONClient uses memoization logic when memoization=true
        method, headers,
        body: method.toLowerCase() === 'get' ? null : body,
        memoized: true
    });

};

export default metricsClient;
