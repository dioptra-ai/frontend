
if (window['DIOPTRA_ENV']['disabledUsageFeedback'] !== 'true') {

    /* eslint-disable */
    !(function() {
        const analytics = window.analytics = window.analytics || [];

        if (!analytics.initialize) if (analytics.invoked)window.console && console.error && console.error('Segment snippet included twice.'); else {
            analytics.invoked = !0; analytics.methods = ['trackSubmit', 'trackClick', 'trackLink', 'trackForm', 'pageview', 'identify', 'reset', 'group', 'track', 'ready', 'alias', 'debug', 'page', 'once', 'off', 'on', 'addSourceMiddleware', 'addIntegrationMiddleware', 'setAnonymousId', 'addDestinationMiddleware']; analytics.factory = function(e) {
                return function() {
                    const t = Array.prototype.slice.call(arguments);

                    t.unshift(e); analytics.push(t);

                    return analytics;
                };
            }; for (let e = 0; e < analytics.methods.length; e++) {
                const key = analytics.methods[e];

                analytics[key] = analytics.factory(key);
            }analytics.load = function(key, e) {
                const t = document.createElement('script');

                t.type = 'text/javascript'; t.async = !0; t.src = `https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`; const n = document.getElementsByTagName('script')[0];

                n.parentNode.insertBefore(t, n); analytics._loadOptions = e;
            }; analytics._writeKey = 'rMMWIHH5QB7uaQvdCuoMPak8edlF6mwJ'; analytics.SNIPPET_VERSION = '4.15.3';
            analytics.load('rMMWIHH5QB7uaQvdCuoMPak8edlF6mwJ');
        }
    }());
}

export const initializeClickTracking = () => {
    if (window.analytics) {
        window.addEventListener('click', (event) => {
            const closestSelector = ['button', '.btn', 'a', '.tab', 'input', 'select', 'li[data-range-key]'].find((selector) => event.target.closest(selector));
            const element = event.target.closest(closestSelector);

            if (element) {
                const trackText = (element.id ?? `#${element.id}`) || 
                    element.name || 
                    element.title ||
                    element.placeholder || 
                    element.innerText;

                if (trackText) {
                    window.analytics.track(trackText, {});
                }
            }
        });
    }
};

export const trackPage = () => {
    window.analytics?.page();
};

export const identify = (id) => {
    window.analytics?.identify(id);
};

export const group = (id) => {
    window.analytics?.group(id);
};

export const resetTracking = () => {
    window.analytics?.reset();
};

export default initializeClickTracking;
