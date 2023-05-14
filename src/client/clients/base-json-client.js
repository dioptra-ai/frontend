import mem from 'p-memoize';
import * as fastq from 'fastq';
import pako from 'pako';

export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

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
    const args1 = args[1];
    const headers = args1?.headers || {};
    const body = args1?.body;

    if (body && !headers['content-encoding'] && body.length > 1000000) {
        headers['content-encoding'] = 'gzip';
        args1.body = pako.gzip(body);
        console.info(`📦 Gzipped ${args1.method} ${args[0]}: ${body.length.toLocaleString()} B -> ${args1.body.length.toLocaleString()} B\n${body}`);
    }
    const res = await fetchQueue.push(() => fetch(...args), args[1]?.priority);

    let responseBody = await res.text();

    try {
        responseBody = JSON.parse(responseBody);
    } catch (e) {
        console.warn(`Failed to JSON parse response: ${responseBody}`);
    }

    if (responseBody?.error) {

        throw new HttpError(res.status, responseBody.error.message);
    } else if (res.ok) {

        return responseBody;
    } else {

        throw new HttpError(res.status, responseBody || res.statusText);
    }
};
const memoizedFetch = mem(jsonFetch, {
    cacheKey: JSON.stringify,
    maxAge: 1000 * 60 * 60 // 1 hour
});
const baseJSONClient = (
    url,
    {method = 'get', body, headers = {}, memoized = false, ...rest} = {}
) => {
    const fetch = memoized ? memoizedFetch : jsonFetch;

    return fetch(url, {
        retries: 15,
        retryDelay: 3000,
        retryOn: [503, 504],
        method,
        headers: {
            'content-type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        ...rest
    });
};

baseJSONClient.get = (url, options) => baseJSONClient(url, {...options, method: 'get'});
baseJSONClient.delete = (url, options) => baseJSONClient(url, {...options, method: 'delete'});
baseJSONClient.post = (url, body, options) => baseJSONClient(url, {...options, body, method: 'post'});
baseJSONClient.put = (url, body, options) => baseJSONClient(url, {...options, body, method: 'put'});

export default baseJSONClient;
