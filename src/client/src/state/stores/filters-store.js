import {autorun, makeAutoObservable} from 'mobx';

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

  get sqlFilters() {
      const keyValues = this.f.reduce((agg, {key, value}) => {
          if (!agg[key]) {
              agg[key] = [];
          }

          agg[key].push(value);

          return agg;
      }, {});

      let filters = Object.keys(keyValues)
          .map((key) => {
              const values = keyValues[key];

              return `(${values.map((v) => `"${key}"='${v}'`).join(' OR ')})`;
          })
          .join(' AND ');

      if (this.mlModelVersion && this.mlModelVersion !== 'null') {
          filters = filters.concat(` AND mlModelVersion=${this.mlModelVersion}`);
      }

      return filters || ' TRUE ';
  }
}

export const filtersStore = new FiltersStore(localStorage.getItem('filtersStore'));

autorun(() => {
    localStorage.setItem('filtersStore', JSON.stringify(filtersStore));
});
