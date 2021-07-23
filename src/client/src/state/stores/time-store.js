import moment from 'moment';
import {makeAutoObservable} from 'mobx';

import {lastHours, lastSeconds} from 'helpers/date-helper';

// TODO: restore this from local storage.
const [initialStart, initialEnd] = lastHours(24);

class TimeStore {
    start = initialStart;

    end = initialEnd;

    // This is true for all "Last xxx minute/hours/days" type time ranges, and false for custom, fixed ranges.
    refreshable = true;

    constructor() {
        makeAutoObservable(this);
    }

    setTimeRange({start, end}) {
        const now = moment();

        this.start = start;
        this.end = end;

        // If the end is very close to now, assume we mean now and make it refreshable.
        // Date picker granulatiry is 1 minute == 60000 ms.
        this.refreshable = now.diff(end) <= 60000;
    }

    refreshTimeRange() {
        if (this.refreshable) {
            const rangeMillisec = this.end.diff(this.start);
            const [start, end] = lastSeconds(rangeMillisec / 1000);

            this.setTimeRange({start, end});
        }
    }

    get sQLTimeFilter() {

        return `"__time" >= TIME_PARSE('${this.start.toISOString()}') AND "__time" < TIME_PARSE('${this.end.toISOString()}')`;
    }
}

export const timeStore = new TimeStore();
