import mem from 'mem';

const memoizedFetch = mem(async (...args) => {
    const res = await fetch(...args);

    if (res.ok) {

        return res.json();
    } else {

        throw new Error(res.statusText);
    }
}, {
    cacheKey: JSON.stringify,
    maxAge: 1000 * 60 * 5 // 5 minutes
});

/**
 * @param  {String} query a query string
 *      see https://druid.apache.org/docs/latest/querying/sql.html
 * @param  {String} resultFormat can be 'object' or 'array'
 * @return {Any}
 *      see https://druid.apache.org/docs/latest/querying/sql.html#responses
 */
const timeseriesClient = ({query, resultFormat = 'object', sqlOuterLimit}) => {

    return memoizedFetch('/api/timeseries', {
        retries: 15,
        retryDelay: 3000,
        retryOn: [503, 504],
        headers: {
            'content-type': 'application/json',
            'x-debug-druid-query': query.replaceAll(/\n/gm, '')
        },
        body: JSON.stringify({
            query,
            resultFormat,
            header: true,
            context: {
                sqlOuterLimit: sqlOuterLimit || timeseriesClient.SQL_OUTER_LIMIT
            }
        }),
        method: 'post'
    }).then((resJson) => {

        if (resJson.error) {

            throw new Error(`${resJson.error}\n${resJson.errorMessage}`);
        } else {

            // Removing the first row as it only contains the column names.
            return resJson.slice(1);
        }
    });
};

export default timeseriesClient;

timeseriesClient.SQL_OUTER_LIMIT = 100;
