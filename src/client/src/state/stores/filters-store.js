import {autorun, makeAutoObservable} from 'mobx';

class FiltersStore {
  // [{key, value}]
  f = [];

  constructor(initialValue) {
      const search = new URL(window.location).searchParams;

      if (search) {
          const filters = search.get('filters');

          if (filters) this.f = JSON.parse(filters);
      } else if (initialValue) {
          this.f = JSON.parse(initialValue).f;
      }
      makeAutoObservable(this);
  }

  get filters() {
      return this.f;
  }

  set filters(f) {
      const url = new URL(window.location);

      if (url.searchParams.has('filters')) {
          url.searchParams.set('filters', JSON.stringify(f));
      } else {
          url.searchParams.append('filters', JSON.stringify(f));
      }

      window.history.pushState({}, null, url);

      this.f = f;
  }

  get sqlFilters() {
      const keyValues = this.f.reduce((agg, {key, value}) => {
          if (!agg[key]) {
              agg[key] = [];
          }

          agg[key].push(value);

          return agg;
      }, {});

      const filters = Object.keys(keyValues)
          .map((key) => {
              const values = keyValues[key];

              return `(${values.map((v) => `"${key}"='${v}'`).join(' OR ')})`;
          })
          .join(' AND ');

      return filters || ' TRUE ';
  }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
