import {autorun, makeAutoObservable} from 'mobx';

class FiltersStore {
  // [{key, value}]
  f = [];

  constructor(initialValue) {
      const filters = new URL(window.location).searchParams.get('filters');

      if (filters) {
          this.f = JSON.parse(filters);
      } else if (initialValue) {
          this.f = JSON.parse(initialValue).f;
      }
      makeAutoObservable(this);
  }

  get filters() {
      return this.f;
  }

  set filters(f) {

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
