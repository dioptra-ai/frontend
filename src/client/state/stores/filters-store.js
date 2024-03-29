import {
    autorun,
    makeAutoObservable
} from 'mobx';
import {default as truncateStr} from 'truncate';

export class Filter {
    constructor({left = '', op = '', right} = {}) {
        this.left = left.trim();
        this.op = op?.toLowerCase();
        this.right = right;
    }

    get right() {

        return this.r;
    }

    set right(r) {
        if (this.op === 'in' || this.op === 'not in') {
            this.r = Array.from(new Set(r));
        } else {
            this.r = r;
        }
    }

    toJSON() {

        return {
            left: this.left,
            op: this.op,
            right: this.right // this calls the getter - otherwise JSON.stringify uses this.r
        };
    }

    static parse(str) {
        const match = (/([^\s]+)(\s+(((=|!=|in|not in|>|>=|<|<=|like|not like)|([^\s]+))\s*)?)?([^\s]+)?/gim).exec(str);

        if (match) {
            const [, left, opStart,,, validOp, /*invalidOp*/, rightStr] = match;

            let op = null;

            let right = '';

            if (validOp) {
                op = validOp.toLowerCase();

                switch (op) {
                case undefined:
                case null:
                    break;
                case '=':
                case '!=':
                case '>':
                case '>=':
                case '<':
                case '<=':
                case 'like':
                case 'not like':
                    if (rightStr) {
                        right = rightStr;
                    }
                    break;
                case 'in':
                case 'not in':
                    if (rightStr) {
                        right = rightStr.split(/\s*,\s*/);
                    }
                    break;
                default:
                    throw new Error(`Unknown filter operator: "${op}"`);
                }
            } else if (opStart) {
                op = opStart.trim();
            }

            return new Filter({left, op, right});
        } else return new Filter();
    }

    toSQLString() {

        switch (this.op) {

        case '=':
        case '!=':
        case 'like':
        case 'not like':

            return `"${this.left}"::text ${this.op} '${this.right}'`;
        case '>':
        case '>=':
        case '<':
        case '<=':

            return `CAST("${this.left}"::text AS FLOAT) ${this.op} ${this.right}`;
        case 'in':
        case 'not in':

            return `"${this.left}"::text ${this.op} (${this.right.map((v) => `'${v}'`).join(',')})`;
        default:
            throw new Error(`Unknown filter operator: "${this.op}"`);
        }
    }

    toString(truncate) {
        switch (this.op) {

        case undefined:
        case null:

            return this.left || '';
        case '=':
        case '!=':
        case '>':
        case '>=':
        case '<':
        case '<=':
        case 'like':
        case 'not like':

            if (this.right) {

                return `${this.left} ${this.op} ${this.right}`;
            } else {

                return `${this.left} ${this.op} `;
            }
        case 'in':
        case 'not in':

            if (this.right) {

                if (this.right.length > 0) {
                    if (truncate) {
                        const truncatedRight = truncateStr(this.right.join(', '), 10, {ellipsis: `...(${this.right.length} items)`});

                        return `${this.left} ${this.op} [${truncatedRight}]`;
                    } else {

                        return `${this.left} ${this.op} ${this.right.join(',')}`;
                    }
                } else {

                    return `${this.left} ${this.op} `;
                }
            } else {

                return `${this.left} ${this.op}`;
            }
        default:
            return `${this.left} ${this.op}`;
        }
    }

    static filtersToSqlStrings(filters) {
        const filtersByKey = filters.reduce((agg, filter) => {
            const {left} = filter;

            if (!agg[left]) {
                agg[left] = [];
            }

            agg[left].push(filter);

            return agg;
        }, {});

        return Object.keys(filtersByKey).map((left) => {
            const keyFilters = filtersByKey[left];

            return `(${keyFilters.map((filter) => filter.toSQLString()).join(' OR ')})`;
        });
    }

    get isOpValid() {

        return ['=', '!=', 'in', 'not in', '<', '<=', '>=', '>', 'like', 'not like'].includes(this.op?.toLowerCase());
    }

    get isLeftComplete() {

        return this.left && this.op !== undefined && this.op !== null;
    }

    get isComplete() {

        return this.left && this.isOpValid && this.right;
    }
}

class FiltersStore {
    // [{left, op, right}]
    f = [];

    // Models to filter with. Several models can be compared.
    m = [];

    // Benchmarks to filter with. Several benchmarks can be compared.
    b = [];

    constructor(localStorageValue) {
        const filters = new URL(window.location).searchParams.get('filters');
        const models = new URL(window.location).searchParams.get('models');
        const benchmarks = new URL(window.location).searchParams.get('benchmarks');
        const {f, m, b} = localStorageValue ? JSON.parse(localStorageValue) : {};

        if (filters) {
            const parsedFilters = JSON.parse(filters);

            this.f = parsedFilters ? parsedFilters.map((f) => new Filter(f)) : [];
        } else {
            this.f = f?.map((_f) => new Filter(_f)) || [];
        }

        this.m = models ? JSON.parse(models) : m;
        this.b = benchmarks ? JSON.parse(benchmarks) : b;

        makeAutoObservable(this);
    }

    get filters() {
        return this.f || [];
    }

    set filters(newFilters) {
        // Dedupe {left: right}.
        const dedupedFilters = newFilters.reduce((agg, newF) => ({
            ...agg,
            [JSON.stringify(newF)]: new Filter(newF)
        }), {});

        this.f = Object.values(dedupedFilters);
    }

    addFilters(...args) {
        this.filters = this.filters.concat(...args);
    }

    setFilter(filter) {
        const existingFilter = this.filters.find((f) => f.left === filter.left);

        if (existingFilter) {
            existingFilter.op = filter.op;
            existingFilter.right = filter.right;
            this.filters = this.filters; // eslint-disable-line no-self-assign
        } else {
            this.addFilters(filter);
        }
    }

    removeFilterByKey(key) {
        const newFilters = this.filters.filter((f) => f.left !== key);

        this.filters = newFilters;
    }

    get models() {
        return this.m || [];
    }

    set models(m) {
        this.m = m;
    }

    getSqlFilters() {

        return Filter.filtersToSqlStrings(this.f);
    }

    getModelSqlFilters(forModel = 0) {
        const allFilters = this.getSqlFilters();
        const model = this.m[forModel];

        allFilters.push(`"model_id"='${model.mlModelId}'`);

        if (model.mlModelVersion && model.mlModelVersion !== 'null') {
            allFilters.push(`"model_version"='${model.mlModelVersion}'`);
        }

        return allFilters;
    }

    getModelFilters(forModel = 0) {
        const model = this.m[forModel];

        return {
            left: 'model_id',
            op: '=',
            right: model.mlModelId
        };
    }

    get benchmarks() {
        return this.b || [];
    }

    set benchmarks(b) {
        this.b = b;
    }

    getBenchmarkSqlFilters(forBenchmark = 0) {
        const allFilters = this.getSqlFilters();
        const benchmark = this.b[forBenchmark];

        allFilters.push(`"benchmark_id"='${benchmark['benchmark_id']}'`);

        return allFilters;
    }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
