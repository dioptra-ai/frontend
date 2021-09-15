import moment from 'moment';
import {autorun, makeAutoObservable} from 'mobx';

import {lastMilliseconds} from 'helpers/date-helper';
import TimeseriesClient from 'clients/timeseries';

const {SQL_OUTER_LIMIT} = TimeseriesClient;

const granularityLadderMs = [
    moment.duration(1, 'second'),
    moment.duration(10, 'second'),
    moment.duration(1, 'minute'),
    moment.duration(10, 'minute'),
    moment.duration(1, 'hour'),
    moment.duration(3, 'hour'),
    moment.duration(1, 'day'),
    moment.duration(5, 'day'),
    moment.duration(1, 'month')
];

class TimeStore {
    _start = null;

    _end = null;

    _lastMs = null;

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    get lastMs() {
        return this._lastMs;
    }

    constructor(initialValue) {
        const search = new URL(window.location).searchParams;
        const initialStore = JSON.parse(initialValue);

        const start = search.get('startTime');
        const end = search.get('endTime');
        const lastMs = search.get('lastMs');

        if ((start && end) || lastMs) {
            this.init({start, end, lastMs});
        } else if (initialStore) {
            this.init({
                start: initialStore._start,
                end: initialStore._end,
                lastMs: initialStore._lastMs
            });
        } else {
            this.init({
                lastMs: moment.duration(24, 'hours').valueOf()
            });
        }

        makeAutoObservable(this);
    }

    init({start, end, lastMs}) {

        if (lastMs) {

            this.setLastMs(lastMs);
        } else if (start && end) {

            this.setTimeRange({start, end});
        }
    }

    setTimeRange({start, end}) {
        this._lastMs = null;
        this._start = moment(start);
        this._end = moment(end);
    }

    setLastMs(number) {
        this._lastMs = moment.duration(number).valueOf();

        const [start, end] = lastMilliseconds(this._lastMs);

        this._start = moment(start);
        this._end = moment(end);
    }

    refreshTimeRange() {
        if (this._lastMs) {
            this.setLastMs(this._lastMs);
        }
    }

    get rangeMillisec() {
        return [this._start.valueOf(), this._end.valueOf()];
    }

    get sqlTimeFilter() {
        return `"__time" >= TIME_PARSE('${this._start.toISOString()}') AND "__time" < TIME_PARSE('${this._end.toISOString()}')`;
    }

    getTimeGranularityMs(maxTicks = SQL_OUTER_LIMIT) {
        const rangeSeconds = this._end.diff(this._start) / 1000;
        const DURATION_MAX_SEC_TO_GRANULARITY = granularityLadderMs.map((duration) => {
            return {
                maxSpanSec: maxTicks * duration.asSeconds(),
                granularity: duration
            };
        });

        for (const {
            maxSpanSec,
            granularity
        } of DURATION_MAX_SEC_TO_GRANULARITY) {
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
