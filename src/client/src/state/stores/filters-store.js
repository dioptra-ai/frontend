import {
    autorun,
    makeAutoObservable
} from 'mobx';

import {
    authStore
} from './auth-store';

export class Filter {
    constructor({left, op, right, fromString} = {}) {
        this.fromString = fromString;
        this.left = left;
        this.op = op;
        this.right = right;

        if (fromString) {
            const match = (/([^\s]+)\s+(([^\s]+)(\s+([^\s]+))?)?/gim).exec(fromString);

            if (match) {
                let [, left, , op, , right] = match;

                if (op) {
                    op = op.toLowerCase();

                    switch (op) {
                    case undefined:
                    case null:
                    case '=':
                        break;
                    case 'in':
                        if (right) {
                            right = right.split(/\s*,\s*/);
                        }
                        break;
                    default:
                        break;
                    }
                }

                this.left = left;
                this.op = op;
                this.right = right;
            }
        } else {
            this.fromString = [left, op, right].join(' ');
        }
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

    get isLeftValid() {

        return Boolean(this.left);
    }

    get isOpValid() {

        return this.op && (['=', 'in'].includes(this.op));
    }

    get isRightValid() {

        return Boolean(this.right);
    }

    get isValid() {

        return this.isLeftValid && this.isOpValid && this.isRightValid;
    }

    toSQLString() {

        if (this.isValid) {

            switch (this.op) {

            case '=':

                return `"${this.left}"='${this.right}'`;
            case 'in':

                return `"${this.left}" in (${this.right.map((v) => `'${v}'`).join(',')})`;
            default:
                throw new Error(`Unknown filter operator: "${this.op}"`);
            }
        } else {
            throw new Error(`Invalid filter: ${this.fromString}`);
        }
    }

    toString() {

        if (this.isValid) {
            let {left, op, right} = this;

            switch (op) {

            case 'in':

                if (right.length > 0) {
                    const firstValue = right[0].toString();
                    const firstDisplayValue = `${firstValue.substring(0, 10)}${firstValue.length > 10 ? '...' : ''}`;

                    if (right.length > 1) {

                        right = `[${firstDisplayValue}, ...]`;
                    } else {

                        right = `[${firstDisplayValue}]`;
                    }
                }
            default:
                break;
            }

            return `${left} ${op} ${right}`;
        } else {

            return this.fromString || '';
        }
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
            this.f = JSON.parse(initialValue).f;
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
            [JSON.stringify(newF)]: newF
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
