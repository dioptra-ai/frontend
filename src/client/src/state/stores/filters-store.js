import {
    autorun,
    makeAutoObservable
} from 'mobx';

import {
    authStore
} from './auth-store';

export class Filter {
    constructor({key, op, value} = {}) {
        this.key = key;
        this.op = op;
        this.value = value;
    }

    get value() {

        return this.v;
    }

    set value(v) {
        if (this.op === 'in') {
            this.v = Array.from(new Set(v));
        } else {
            this.v = v;
        }
    }

    toJSON() {

        return {
            key: this.key,
            op: this.op,
            value: this.value // this calls the getter - otherwise JSON.stringify uses this.v
        };
    }

    static parse(str) {
        const match = (/([a-zA-Z1-9]+)(\s*(=)\s*|\s+(in)\s+)?([a-zA-Z1-9]+)?/gim).exec(str.trim());

        if (match) {
            const [, key, , opEQ, opIN, valueStr] = match;

            let op = null;

            let value = null;

            if (opEQ) {
                op = opEQ;
                value = valueStr;
            } else if (opIN) {
                op = opIN.toLowerCase();

                if (valueStr) {
                    value = valueStr.split(/\s*,\s*/);
                }
            }

            return new Filter({key, op, value});
        } else return new Filter();
    }

    toSQLString() {

        switch (this.op) {

        case '=':

            return `"${this.key}"='${this.value}'`;
        case 'in':

            return `"${this.key}" in (${this.value.map((v) => `'${v}'`).join(',')})`;
        default:
            throw new Error(`Unknown filter operator: "${this.op}"`);
        }
    }

    toString() {
        switch (this.op) {

        case undefined:
        case null:

            return this.key || '';
        case '=':

            if (this.value) {

                return `${this.key}=${this.value}`;
            } else {

                return `${this.key}=`;
            }
        case 'in':

            if (this.value) {

                if (this.value.length > 0) {
                    const firstValue = this.value[0].toString();
                    const firstDisplayValue = `${firstValue.substring(0, 10)}${firstValue.length > 10 ? '...' : ''}`;

                    if (this.value.length > 1) {

                        return `${this.key} in [${firstDisplayValue}, ...]`;
                    } else {

                        return `${this.key} in [${firstDisplayValue}]`;
                    }
                } else {

                    return `${this.key} in []`;
                }
            } else {

                return `${this.key} in `;
            }
        default:
            throw new Error(`Unknown filter operator: "${this.op}"`);
        }
    }

    get isComplete() {

        return !this.key && !this.op && !this.value;
    }
}

class FiltersStore {
    // [{key, op, value}]
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
        // Dedupe {key: value}.
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
            const {key} = filter;

            if (!agg[key]) {
                agg[key] = [];
            }

            agg[key].push(filter);

            return agg;
        }, {});

        const allFilters = Object.keys(filtersByKey).map((key) => {
            const keyFilters = filtersByKey[key];

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
