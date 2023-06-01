import os from 'os';
import process from 'process';
import macaddress from 'macaddress';
import {Analytics} from '@segment/analytics-node';

const analytics = new Analytics({writeKey: 'rMMWIHH5QB7uaQvdCuoMPak8edlF6mwJ'});

if (process.env['disabledUsageFeedback'] !== 'true') {
    macaddress.one((err, mac) => {
        if (!err) {
            analytics.track({
                anonymousId: mac,
                event: 'Server Started',
                context: {
                    version: process.env.COMMIT_REF,
                    environment: process.env.ENVIRONMENT,
                    platform: process.platform,
                    arch: process.arch,
                    hostname: os.hostname(),
                    cpus: os.cpus().length,
                    memoryGB: os.totalmem() / 1024 / 1024 / 1024,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    macAddress: mac,
                    nodeVersion: process.version,
                    isK8s: process.env.KUBERNETES_SERVICE_HOST !== undefined
                }
            });
        }
    });
}
