/**
 * @param  {String} method http method
 * @param  {Object} data can be 'object'
 */
const userClient = async (method, data = {}) => {
    // TODO: Replace this with baseJSONClient
    const res = await fetch('/api/user', {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(data),
        method
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

        throw new Error(body.error.message);
    } else {

        throw new Error(body || res.statusText);
    }
};

export default userClient;
