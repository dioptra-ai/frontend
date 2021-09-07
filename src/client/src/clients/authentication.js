/**
 * @param  {String} route endpoint of auth controller
 * @param  {Object} data can be 'object'
 */
const AuthenticationClient = async (route, data = {}) => {
    const res = await window.fetch(`/api/auth/${route}`, {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data),
        method: 'post'
    });

    let body = await res.text();

    try {
        body = JSON.parse(body);
    } catch (e) {
        console.warn(`Failed to JSON parse response: ${body}`);
    }

    if (res.ok) {

        return body;
    } else if (body.error) {

        throw new Error(body.error);
    } else {

        throw new Error(body || res.statusText);
    }
};

export default AuthenticationClient;
