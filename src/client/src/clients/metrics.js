import baseJSONClient from 'clients/base-json-client';

const metricsClient = (path, body) => {

    return baseJSONClient(`/api/metrics/${path}`, {
        method: 'POST',
        body
    });
};

export default metricsClient;
