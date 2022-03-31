const fetchWithRetry = require('fetch-retry')(fetch, {
    retryOn: [503, 504],
    retries: 3,
    retryDelay: 5000
});

export default fetchWithRetry;
