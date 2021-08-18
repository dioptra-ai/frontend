import {autorun, makeAutoObservable, runInAction} from 'mobx';
import AuthenticationClient from '../../clients/authentication';
import UserClient from '../../clients/user';

class AuthStore {
  isAuthenticated = false;

  userData = null;

  error = null;

  loading = false;

  success = false;

  constructor(localData) {
      if (localData) {
          const parsedLocalData = JSON.parse(localData);

          this.isAuthenticated = parsedLocalData.isAuthenticated;
          this.userData = parsedLocalData.userData;
          this.error = null;
      }
      makeAutoObservable(this);
  }

  get authStatus() {
      return this.isAuthenticated;
  }

  get user() {
      return this.userData;
  }

  get authError() {
      return this.error;
  }

  get loading() {
      return this.loading;
  }

  get success() {
      return this.success;
  }

  set authStatus(status) {
      this.isAuthenticated = status;
  }

  set user(data) {
      this.userData = data;
  }

  set authError(error) {
      this.error = error;
  }

  set loading(status) {
      this.loading = status;
  }

  set success(status) {
      this.loading = status;
  }

  async tryLogin(data) {
      try {
          const resp = await AuthenticationClient('login', data);

          runInAction(() => {
              this.authStatus = true;
              this.user = resp;
              this.authError = null;
          });
      } catch (e) {
          runInAction(() => {
              this.authStatus = false;
              this.user = null;
              this.authError = e.message;
          });
      }
  }

  async tryLogout() {
      try {
          await AuthenticationClient('logout');
      } finally {
          runInAction(() => {
              this.authStatus = false;
              this.user = null;
              this.authError = null;
          });
      }
  }

  async tryUpdate(data) {
      try {
          runInAction(() => {
              this.loading = true;
              this.success = false;
          });
          const resp = await UserClient('put', data);

          runInAction(() => {
              this.user = resp;
              this.success = true;
              this.loading = false;
          });
      } catch (e) {
          runInAction(() => {
              this.authError = e.message;
              this.loading = false;
          });
      }
  }
}

export const authStore = new AuthStore(localStorage.getItem('authStore'));

autorun(() => {
    localStorage.setItem('authStore', JSON.stringify(authStore));
});
