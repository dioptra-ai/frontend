const fetchWithRetry = require('fetch-retry')(fetch, {
    retryOn: [503, 504],
    retries: 15,
    retryDelay: 3000
});

export default fetchWithRetry;
