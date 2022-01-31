import {
    autorun,
    makeAutoObservable
} from 'mobx';

import {
    authStore
} from './auth-store';

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
        const match = (/([^\s]+)(\s+((=|in|.+)\s*)?)?([^\s]+)?/gim).exec(str);

        if (match) {
            const [, left, opStart,, validOp, rightStr] = match;

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

    toString() {
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
                    const firstValue = this.right[0].toString();
                    const firstDisplayValue = `${firstValue.substring(0, 10)}${firstValue.length > 10 ? '...' : ''}`;

                    if (this.right.length > 1) {

                        return `${this.left} ${this.op} [${firstDisplayValue}, ...]`;
                    } else {

                        return `${this.left} ${this.op} [${firstDisplayValue}]`;
                    }
                } else {

                    return `${this.left} ${this.op} []`;
                }
            } else {

                return `${this.left} ${this.op} `;
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

    mlModelVersion = ''

    constructor(initialValue) {
        const filters = new URL(window.location).searchParams.get('filters');
        const mlModelVersion = new URL(window.location).searchParams.get('mlModelVersion');

        if (filters) {
            const parsedFilters = JSON.parse(filters);

            this.f = parsedFilters ? parsedFilters.map((f) => new Filter(f)) : [];
            this.mlModelVersion = mlModelVersion;
        } else if (initialValue) {
            this.f = JSON.parse(initialValue).f.map((_f) => new Filter(_f));
            this.mlModelVersion = mlModelVersion;
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

    get modelVersion() {
        return this.mlModelVersion;
    }

    set modelVersion(v) {
        this.mlModelVersion = v;
    }

    concatSQLFilters() {
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

        if (this.mlModelVersion && this.mlModelVersion !== 'null') {
            allFilters.push(`"model_version"='${this.mlModelVersion}'`);
        }

        return allFilters;
    }

    get sqlFilters() {
        const filters = this.concatSQLFilters();

        filters.push(`organization_id='${_WEBPACK_DEF_OVERRIDE_ORG_ID_ || authStore.userData.activeOrganizationMembership.organization._id}'`);

        return filters.join(' AND ') || ' TRUE ';
    }

    get __RENAME_ME__sqlFilters() {
        const filters = this.concatSQLFilters();

        return filters.join(' AND ') || ' TRUE ';

    }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
