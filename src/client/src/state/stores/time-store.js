import {makeAutoObservable} from 'mobx';

import {lastHours} from 'helpers/date-helper';

// TODO: restore this from local storage.
const [initialStart, initialEnd] = lastHours(24);

class TimeStore {
    start = initialStart;

    end = initialEnd;

    constructor() {
        makeAutoObservable(this);
    }

    setTimeRange({start, end}) {
        this.start = start;
        this.end = end;
    }

    get sQLTimeFilter() {

        return `"__time" >= TIME_PARSE('${this.start.toISOString()}') AND "__time" < TIME_PARSE('${this.end.toISOString()}')`;
    }
}

export const timeStore = new TimeStore();
