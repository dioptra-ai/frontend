import {Router} from 'react-router-dom';

import {history, replaceUrl} from 'helpers/history';

let url = new URL(window.location);
const stickyParams = ['startTime', 'endTime', 'filters', 'segmentation'];

history.listen(() => {
    const newUrl = new URL(window.location);

    if (newUrl.toString() !== url.toString()) {
        const params = url.searchParams;

        stickyParams.forEach((p) => {

            if (params.has(p) && !newUrl.searchParams.has(p)) {
                newUrl.searchParams.set(p, params.get(p));
            }
        });

        url = newUrl;

        replaceUrl(newUrl);
    }
});

const StickyParamsRouter = (rest) => (
    <Router {...rest} history={history}/>
);

export default StickyParamsRouter;
