/**
 * @param  {String} route endpoint of auth controller
 * @param  {Object} data can be 'object'
 */
const AuthenticationClient = (route, data = {}) => {
    return window
        .fetch(`/api/auth/${route}`, {
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
                throw new Error('Wrong username or password');
            }
        })
        .catch((resJson) => {
            if (resJson.name === 'Error') {
                throw new Error(resJson.message);
            } else {
                console.log(resJson);
                throw new Error(resJson);
            }
        });
};

export default AuthenticationClient;
