/**
 * @param  {String} query a query string
 *      see https://druid.apache.org/docs/latest/querying/sql.html
 * @param  {String} resultFormat can be 'object' or 'array'
 */
const AuthenticationClient = (data) => {
    return window
        .fetch('/api/auth/login', {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data),
            method: 'post'
        })
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(res.statusText);
            }
        })
        .catch((resJson) => {
            if (resJson.error) {
                throw new Error(`${resJson.error}\n${resJson.errorMessage}`);
            } else {
                // Removing the first row as it only contains the column names.
                throw new Error(`Something went wrong${resJson}`);
            }
        });
};

export default AuthenticationClient;
