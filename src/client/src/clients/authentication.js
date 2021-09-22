import baseJSONClient from './base-json-client';

const authenticationClient = (route, body) => {

    return baseJSONClient(`/api/auth/${route}`, {
        method: 'post', body
    });
};

export default authenticationClient;
