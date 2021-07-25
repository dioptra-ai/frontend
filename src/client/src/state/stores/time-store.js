import moment from 'moment';
import {autorun, makeAutoObservable} from 'mobx';

import {lastHours, lastSeconds} from 'helpers/date-helper';
import TimeseriesClient from 'clients/timeseries';

const {SQL_OUTER_LIMIT} = TimeseriesClient;

const granularityLadder = [
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
];

const [initialStart, initialEnd] = lastHours(24);

class TimeStore {
    startMoment = moment(initialStart);

    endMoment = moment(initialEnd);

    // This is true for all "Last xxx minute/hours/days" type time ranges, and false for custom, fixed ranges.
    refreshable = true;

    get start() {

        return this.startMoment;
    }

    get end() {

        return this.endMoment;
    }

    constructor(initialValue) {
        if (initialValue) {
            const initialStore = JSON.parse(initialValue);

            this.startMoment = moment(initialStore.startMoment);
            this.endMoment = moment(initialStore.endMoment);
            this.refreshable = initialStore.refreshable;
        }
        makeAutoObservable(this);
    }

    setTimeRange({start, end}) {

        this.startMoment = moment(start);
        this.endMoment = moment(end);

        // If the end is very close to now, assume we mean now and make it refreshable.
        // Date picker granulatiry is 1 minute == 60000 ms.
        this.refreshable = moment().diff(this.endMoment) <= 60000;

        localStorage.setItem('timeStore', JSON.stringify(this));
    }

    refreshTimeRange() {
        if (this.refreshable) {
            const spanMillisec = this.endMoment.diff(this.startMoment);
            const [start, end] = lastSeconds(spanMillisec / 1000);

            this.setTimeRange({start, end});
        }
    }

    get rangeMillisec() {

        return [this.startMoment.valueOf(), this.endMoment.valueOf()];
    }

    get sqlTimeFilter() {

        return `"__time" >= TIME_PARSE('${this.startMoment.toISOString()}') AND "__time" < TIME_PARSE('${this.endMoment.toISOString()}')`;
    }

    // TODO: Find a better way to deal with sparse data than adding 10x the max number of points.
    getTimeGranularity(maxTicks = 10 * SQL_OUTER_LIMIT) {
        const rangeSeconds = this.endMoment.diff(this.startMoment) / 1000;
        const DURATION_MAX_SEC_TO_GRANULARITY = granularityLadder.map((duration) => {

            return {
                maxSpanSec: maxTicks * duration.asSeconds(),
                granularity: duration
            };
        });

        for (const {maxSpanSec, granularity} of DURATION_MAX_SEC_TO_GRANULARITY) {
            if (rangeSeconds < maxSpanSec) {

                return granularity;
            }
        }

        return moment.duration(1, 'month');
    }
}

export const timeStore = new TimeStore(localStorage.getItem('timeStore'));

autorun(() => {
    localStorage.setItem('timeStore', JSON.stringify(timeStore));
});
