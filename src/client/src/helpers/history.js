import {createBrowserHistory} from 'history';

export const history = createBrowserHistory();

export const pushUrl = (url, state) => {

    history.push({
        pathname: url.pathname,
        search: `?${url.searchParams.toString()}`
    }, state);
};

export const replaceUrl = (url, state) => {

    history.replace({
        pathname: url.pathname,
        search: `?${url.searchParams.toString()}`
    }, state);
};
