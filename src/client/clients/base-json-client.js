import mem from 'p-memoize';

const jsonFetch = async (...args) => {
    const res = await fetch(...args);

    let responseBody = await res.text();

    try {
        responseBody = JSON.parse(responseBody);
    } catch (e) {
        console.warn(`Failed to JSON parse response: ${responseBody}`);
    }

    if (responseBody?.error) {

        throw new Error(responseBody.error.message);
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
const baseJSONClient = (url, {method = 'get', body, headers = {'content-type': 'application/json'}, memoized = false, ...rest} = {}) => {
    const fetch = memoized ? memoizedFetch : jsonFetch;

    return fetch(url, {
        retries: 15,
        retryDelay: 3000,
        retryOn: [503, 504],
        method, headers,
        body: body ? JSON.stringify(body) : undefined,
        ...rest
    });
};

baseJSONClient.get = (url, options) => baseJSONClient(url, {...options, method: 'get'});
baseJSONClient.post = (url, body, options) => baseJSONClient(url, {...options, body, method: 'post'});

export default baseJSONClient;
