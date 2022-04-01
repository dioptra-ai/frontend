const fetchWithRetry = require('fetch-retry')(fetch, {
    retryOn: [503, 504],
    retries: 5,
    retryDelay: 60000
});

export default fetchWithRetry;
