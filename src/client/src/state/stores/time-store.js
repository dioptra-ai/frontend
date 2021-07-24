import moment from 'moment';
import {makeAutoObservable} from 'mobx';

import {lastHours, lastSeconds} from 'helpers/date-helper';
import TimeseriesClient from 'clients/timeseries';

const {SQL_OUTER_LIMIT} = TimeseriesClient;

const DURATION_MAX_SEC_TO_GRANULARITY = [
    moment.duration(1, 'second'),
    moment.duration(5, 'second'),
    moment.duration(10, 'second'),
    moment.duration(30, 'second'),
    moment.duration(1, 'minute'),
    moment.duration(5, 'minute'),
    moment.duration(10, 'minute'),
    moment.duration(30, 'minute'),
    moment.duration(1, 'hour'),
    moment.duration(2, 'hour'),
    moment.duration(3, 'hour'),
    moment.duration(6, 'hour'),
    moment.duration(12, 'hour'),
    moment.duration(1, 'day'),
    moment.duration(2, 'day'),
    moment.duration(5, 'day'),
    moment.duration(10, 'day'),
    moment.duration(15, 'day'),
    moment.duration(1, 'month')
].map((duration) => {

    return {
        maxSpanSec: SQL_OUTER_LIMIT * duration.asSeconds(),
        granularity: duration
    };
});

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
            const spanMillisec = this.end.diff(this.start);
            const [start, end] = lastSeconds(spanMillisec / 1000);

            this.setTimeRange({start, end});
        }
    }

    get rangeMillisec() {

        return [this.start.valueOf(), this.end.valueOf()];
    }

    get sQLTimeFilter() {

        return `"__time" >= TIME_PARSE('${this.start.toISOString()}') AND "__time" < TIME_PARSE('${this.end.toISOString()}')`;
    }

    get timeGranularity() {
        const rangeSeconds = this.end.diff(this.start) / 1000;

        for (const {maxSpanSec, granularity} of DURATION_MAX_SEC_TO_GRANULARITY) {
            if (rangeSeconds < maxSpanSec) {

                return granularity;
            }
        }

        return moment.duration(1, 'month');
    }

    get sQLTimeGranularity() {

        return this.timeGranularity.toISOString();
    }
}

export const timeStore = new TimeStore();
