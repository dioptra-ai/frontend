import {
    autorun,
    makeAutoObservable
} from 'mobx';

export class Filter {
    constructor({left, op, right} = {}) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    get right() {

        return this.r;
    }

    set right(r) {
        if (this.op === 'in') {
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
        const match = (/([^\s]+)(\s+(((=|in)|([^\s]+))\s*)?)?([^\s]+)?/gim).exec(str);

        if (match) {
            const [, left, opStart,,, validOp, /* invalidOp*/ , rightStr] = match;

            let op = null;

            let right = '';

            if (validOp) {
                op = validOp.toLowerCase();

                switch (op) {
                case undefined:
                case null:
                    break;
                case '=':
                    if (rightStr) {
                        right = rightStr;
                    }
                    break;
                case 'in':
                    if (rightStr) {
                        right = rightStr.split(/\s*,\s*/);
                    }
                    break;
                default:
                    throw new Error(`Unknown filter operator: "${op}"`);
                }
            } else if (opStart) {
                op = opStart;
            }

            return new Filter({left, op, right});
        } else return new Filter();
    }

    toSQLString() {

        switch (this.op?.toLowerCase()) {

        case '=':

            return `"${this.left}"='${this.right}'`;
        case 'in':
        case 'not in':

            return `"${this.left}" ${this.op} (${this.right.map((v) => `'${v}'`).join(',')})`;
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

            if (this.right) {

                return `${this.left} = ${this.right}`;
            } else {

                return `${this.left} = `;
            }
        case 'in':
        case 'not in':

            if (this.right) {

                if (this.right.length > 0) {
                    if (truncate) {
                        const firstValue = this.right[0].toString();
                        const firstDisplayValue = `${firstValue.substring(0, 10)}${firstValue.length > 10 ? '...' : ''}`;

                        if (this.right.length > 1) {

                            return `${this.left} ${this.op} [${firstDisplayValue}, ...]`;
                        } else {

                            return `${this.left} ${this.op} [${firstDisplayValue}]`;
                        }
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

    get isOpValid() {

        return ['=', 'in', 'not in'].includes(this.op?.toLowerCase());
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

        if (filters && models && benchmarks) {
            const parsedFilters = JSON.parse(filters);
            const parsedModels = JSON.parse(models);
            const parsedBenchmarks = JSON.parse(benchmarks);

            this.f = parsedFilters ? parsedFilters.map((f) => new Filter(f)) : [];
            this.m = parsedModels;
            this.b = parsedBenchmarks;
        } else if (localStorageValue) {
            const parsedLocalStorageValue = JSON.parse(localStorageValue);

            this.f = parsedLocalStorageValue.f.map((_f) => new Filter(_f));
            this.m = parsedLocalStorageValue.m;
            this.b = parsedLocalStorageValue.b;
        }

        makeAutoObservable(this);
    }

    get filters() {
        return this.f;
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

    get models() {
        return this.m;
    }

    set models(m) {
        this.m = m;
    }

    getModelSqlFilters(forModel = 0) {
        const filtersByKey = this.f.reduce((agg, filter) => {
            const {left} = filter;

            if (!agg[left]) {
                agg[left] = [];
            }

            agg[left].push(filter);

            return agg;
        }, {});

        const allFilters = Object.keys(filtersByKey).map((left) => {
            const keyFilters = filtersByKey[left];

            return `(${keyFilters.map((filter) => filter.toSQLString()).join(' OR ')})`;
        });

        const model = this.m[forModel];

        allFilters.push(`"model_id"='${model.mlModelId}'`);

        if (model.mlModelVersion && model.mlModelVersion !== 'null') {
            allFilters.push(`"model_version"='${this.mlModelVersion}'`);
        }

        return allFilters;
    }

    get benchmarks() {
        return this.b;
    }

    set benchmarks(b) {
        this.b = b;
    }

    getBenchmarkSqlFilters(forbenchmark = 0) {
        const filtersByKey = this.f.reduce((agg, filter) => {
            const {left} = filter;

            if (!agg[left]) {
                agg[left] = [];
            }

            agg[left].push(filter);

            return agg;
        }, {});

        const allFilters = Object.keys(filtersByKey).map((left) => {
            const keyFilters = filtersByKey[left];

            return `(${keyFilters.map((filter) => filter.toSQLString()).join(' OR ')})`;
        });

        const benchmark = this.b[forbenchmark];

        allFilters.push(`"benchmark_id"='${benchmark['benchmark_id']}'`);

        return allFilters;
    }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
