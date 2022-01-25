import {makeAutoObservable} from 'mobx';

class ErrorStore {
    lastError = null;

    constructor() {
        makeAutoObservable(this);
    }

    reportError(error) {
        this.lastError = error;

        // TODO: send to Sentry.io, show a notice, etc.
        console.error(error);
    }
}

export const errorStore = new ErrorStore();
