import mem from 'mem';
import fetchWithRetry from './fetch-retry-client';

const jsonFetch = async (...args) => {
    const res = await fetchWithRetry(...args);

    let responseBody = await res.text();

    try {
        responseBody = JSON.parse(responseBody);
    } catch (e) {
        console.warn(`Failed to JSON parse response: ${responseBody}`);
    }

    if (responseBody.error) {

        throw new Error(responseBody.error);
    } else if (res.ok) {

        return responseBody;
    } else {

        throw new Error(responseBody || res.statusText);
    }
};
const memoizedFetch = mem(jsonFetch, {
    cacheKey: JSON.stringify,
    maxAge: 1000 * 60 * 5 // 5 minutes
});
const baseJSONClient = (url, {method = 'get', body, headers = {'content-type': 'application/json'}, memoized = false} = {}) => {
    const fetch = memoized ? memoizedFetch : jsonFetch;

    return fetch(url, {
        retries: 15,
        retryDelay: 3000,
        retryOn: [500, 503, 504],
        method, headers,
        body: body ? JSON.stringify(body) : undefined
    });
};

export default baseJSONClient;
