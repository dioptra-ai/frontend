import {autorun, makeAutoObservable} from 'mobx';
import qs from 'qs';

class FiltersStore {
  // [{key, value}]
  f = [];

  constructor(initialValue) {
      const {search} = window.location;

      if (search) {
          const {filters} = qs.parse(search, {
              ignoreQueryPrefix: true
          });

          const parsedFilters = filters ? JSON.parse(filters) : {};
          const queryFilters = [];

          Object.keys(parsedFilters).forEach((key) => {
              if (Array.isArray(parsedFilters[key])) {
                  parsedFilters[key].forEach((value) => {
                      queryFilters.push({key, value});
                  });
              } else queryFilters.push({key, value: parsedFilters[key]});
          });
          this.f = queryFilters;
      } else if (initialValue) {
          this.f = JSON.parse(initialValue).f;
      }
      makeAutoObservable(this);
  }

  get filters() {
      return this.f;
  }

  set filters(f) {
      const fObj = f.reduce((obj, {key, value}) => {
          if (obj.hasOwnProperty(key)) return {...obj, [key]: [obj[key], value]};

          return {...obj, [key]: value};
      }, {});

      const {origin, pathname, search} = window.location;

      const {filters, ...rest} = qs.parse(search, {
          ignoreQueryPrefix: true
      });

      const query = qs.stringify({
          filters: JSON.stringify(fObj) || filters,
          ...rest
      });

      const href = `${origin}${pathname}?${query}`;

      window.history.pushState({}, null, href);

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
