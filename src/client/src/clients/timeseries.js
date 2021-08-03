/**
 * @param  {String} query a query string
 *      see https://druid.apache.org/docs/latest/querying/sql.html
 * @param  {String} resultFormat can be 'object' or 'array'
 * @return {Any}
 *      see https://druid.apache.org/docs/latest/querying/sql.html#responses
 */
const TimeseriesClient = ({query, resultFormat = 'object', sqlOuterLimit}) => {

    return window.fetch('/api/timeseries', {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            query,
            resultFormat,
            header: true,
            context: {
                sqlOuterLimit: sqlOuterLimit || TimeseriesClient.SQL_OUTER_LIMIT
            }
        }),
        method: 'post'
    }).then((res) => {

        if (res.ok) {

            return res.json();
        } else {

            throw new Error(res.statusText);
        }
    }).then((resJson) => {

        if (resJson.error) {

            throw new Error(`${resJson.error}\n${resJson.errorMessage}`);
        } else {

            // Removing the first row as it only contains the column names.
            return resJson.slice(1);
        }
    });
};

export default TimeseriesClient;

TimeseriesClient.SQL_OUTER_LIMIT = 100;
