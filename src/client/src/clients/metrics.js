import baseJSONClient from 'clients/base-json-client';
import mem from 'mem';

const jsonFetch = async (...args) => {
    const res = await window.fetch(...args);

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

const metricsClient = (path, body) => {
    if (path === '/compute') {

    }

    return baseJSONClient(`/api/metrics/${path}`, {
        method: 'POST',
        body
    });
};

export default metricsClient;
