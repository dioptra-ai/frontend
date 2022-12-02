import moment from 'moment';
import {autorun, makeAutoObservable} from 'mobx';

import {lastMilliseconds, timeRangeGranularity} from 'helpers/date-helper';

class TimeStore {
    _start = null;

    _end = null;

    _lastMs = null;

    _isModified = false;

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    get lastMs() {
        return this._lastMs;
    }

    get isModified() {
        return this._isModified;
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

        this._isModified = false;

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
        if (start || end) {
            if (start) {
                this._start = moment(start);
            }
            if (end) {
                this._end = moment(end);
            }
            this._lastMs = null;
            this._isModified = true;
        }
    }

    setLastMs(number) {
        this._lastMs = moment.duration(number).valueOf();

        const [start, end] = lastMilliseconds(this._lastMs);

        this._start = moment(start);
        this._end = moment(end);
        this._isModified = true;
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

        return `"timestamp" >= TIMESTAMPTZ('${this._start.toISOString()}') AND "timestamp" < TIMESTAMPTZ('${this._end.toISOString()}')`;
    }

    get timeFilter() {

        return {
            left: {
                left: 'timestamp',
                op: '>=',
                right: this._start.toISOString()
            },
            op: 'and',
            right: {
                left: 'timestamp',
                op: '<',
                right: this._end.toISOString()
            }
        };
    }

    getTimeGranularity(maxTicks) {

        return timeRangeGranularity(this._start, this._end, maxTicks);
    }
}

export const timeStore = new TimeStore(localStorage.getItem('timeStore'));

autorun(() => {
    localStorage.setItem('timeStore', JSON.stringify(timeStore));
});
