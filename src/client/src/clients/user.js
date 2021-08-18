/**
 * @param  {String} method http method
 * @param  {Object} data can be 'object'
 */
const UserClient = (method, data = {}) => {
    return window
        .fetch('/api/user', {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data),
            method
        })
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error('Username already taken');
            }
        })
        .catch((resJson) => {
            if (resJson.message) {
                throw new Error(resJson.message);
            } else {
                throw new Error(resJson);
            }
        });
};

export default UserClient;
