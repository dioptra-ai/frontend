// Just a forwarder middleware to the analytics service.
import fetch from 'node-fetch';

const analyticsEndpoint = process.env.ANALYTICS_ENGINE_URL || process.env.METRICS_ENGINE_URL;

const analytics = async (req, res, next) => {
    try {
        const newUrl = req.url.replace('/api/analytics', '');
        const response = await fetch(`${analyticsEndpoint}${newUrl}`, {
            method: req.method,
            headers: {
                ...req.headers,
                'x-organization-id': req.user.requestOrganizationId
            },
            body: JSON.stringify({
                ...req.body,
                // TODO: remove this once the analytics service is included in dev/prod.
                organization_id: req.user.requestOrganizationId
            })
        });

        response.body.pipe(res);
    } catch (e) {
        next(e);
    }
};

export default analytics;
