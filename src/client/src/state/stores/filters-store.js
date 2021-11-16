import {
    autorun,
    makeAutoObservable
} from 'mobx';

import {
    authStore
} from './auth-store';


class FiltersStore {
    // [{key, value}]
    f = [];

    mlModelVersion = ''

    constructor(initialValue) {
        const filters = new URL(window.location).searchParams.get('filters');
        const mlModelVersion = new URL(window.location).searchParams.get('mlModelVersion');

        if (filters) {
            this.f = JSON.parse(filters);
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

    set filters(f) {
        this.f = f;
    }

    get modelVersion() {
        return this.mlModelVersion;
    }

    set modelVersion(v) {
        this.mlModelVersion = v;
    }

    // TODO: Get rid of this when multitenancy is properly implemented server-side.
    // eslint-disable-next-line class-methods-use-this
    get organizationIdFilter() {

        return `organization_id='${_WEBPACK_DEF_OVERRIDE_ORG_ID_ || authStore.userData.activeOrganizationMembership.organization._id}'`;
    }

    get sqlFilters() {
        const keyValues = this.f.reduce((agg, {
            key,
            value
        }) => {
            if (!agg[key]) {
                agg[key] = [];
            }

            agg[key].push(value);

            return agg;
        }, {});

        const filters = Object.keys(keyValues).map((key) => {
            const values = keyValues[key];

            return `(${values.map((v) => `"${key}"='${v}'`).join(' OR ')})`;
        });

        if (this.mlModelVersion && this.mlModelVersion !== 'null') {
            filters.push(`"model_version"='${this.mlModelVersion}'`);
        }

        filters.push(this.organizationIdFilter);

        return filters.join(' AND ') || ' TRUE ';
    }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
