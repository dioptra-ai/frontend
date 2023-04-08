import mem from 'p-memoize';
import * as fastq from 'fastq';

// Priority queue for fetch requests. This is to prevent the browser from
// clogging up with requests that are not important.
const lowPriorityQueue = [];
const mediumPriorityQueue = [];
const highPriorityQueue = [];
const fetchQueue = fastq.promise((fn, priority) => {
    if (priority === 'high') {
        highPriorityQueue.push(fn);
    } else if (priority === 'low') {
        lowPriorityQueue.push(fn);
    } else {
        mediumPriorityQueue.push(fn);
    }

    if (highPriorityQueue.length) {
        return highPriorityQueue.shift()();
    } else if (mediumPriorityQueue.length) {
        return mediumPriorityQueue.shift()();
    } else if (lowPriorityQueue.length) {
        return lowPriorityQueue.shift()();
    } else throw new Error('Empty fetch queue...');
});

const jsonFetch = async (...args) => {
    const res = await fetchQueue.push(() => fetch(...args), args[1]?.priority);

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
    maxAge: 1000 * 60 * 60 // 1 hour
});
const baseJSONClient = (
    url,
    {method = 'get', body, headers = {'content-type': 'application/json'}, memoized = true, ...rest} = {}
) => {
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
baseJSONClient.delete = (url, options) => baseJSONClient(url, {...options, method: 'delete'});
baseJSONClient.post = (url, body, options) => baseJSONClient(url, {...options, body, method: 'post'});

export default baseJSONClient;
