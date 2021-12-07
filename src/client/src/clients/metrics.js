import baseJSONClient from 'clients/base-json-client';
// import mem from 'mem';
// import {jsonFetch} from './base-json-client';

const metricsClient = (path, body) => {
    // if (path === '/compute') {
    // if map_mar && timegranularity!=null

    // }

    console.log('path + body: ');
    console.log(path);
    console.log(body);

    return baseJSONClient(`/api/metrics/${path}`, {
        method: 'POST',
        body,
        memoized: true
    });
};

export default metricsClient;
