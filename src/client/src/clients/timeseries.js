/**
 * @param  {String} query a query string
 *      see https://druid.apache.org/docs/latest/querying/sql.html
 * @param  {String} resultFormat can be 'object' or 'array'
 * @return {Any}
 *      see https://druid.apache.org/docs/latest/querying/sql.html#responses
 */
export default ({query, resultFormat = 'object'}) => {

    return window.fetch('/api/timeseries', {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            query,
            resultFormat,
            header: true,
            context: {sqlOuterLimit: 100}
        }),
        method: 'post'
    }).then((res) => res.json()).then((resJson) => {

        if (resJson.error) {

            return Promise.reject(new Error(resJson.error));
        } else {

            // Removing the first row as it only contains the column names.
            return resJson.slice(1);
        }
    }).catch(console.error);
};
