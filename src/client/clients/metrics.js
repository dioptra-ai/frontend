import baseJSONClient from 'clients/base-json-client';

const metricsClient = (path, body, memoized = true, rest) => {

    return baseJSONClient(`/api/metrics/${path}`, { //baseJSONClient uses memoization logic when memoization=true
        method: body ? 'POST' : 'GET',
        headers: {'content-type': 'application/json'},
        body,
        memoized,
        ...rest
    });

};

export default metricsClient;
