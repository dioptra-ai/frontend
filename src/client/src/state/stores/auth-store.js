import {autorun, makeAutoObservable, runInAction} from 'mobx';
import AuthenticationClient from '../../clients/authentication';

class AuthStore {
  isAuthenticated = false;

  userData = null;

  constructor() {
      makeAutoObservable(this);
      let localData = localStorage.getItem('authStore');

      if (localData) {
          localData = JSON.parse(localData);
          this.isAuthenticated = localData.isAuthenticated;
          this.userData = localData.userData;
      }
  }

  get authStatus() {
      return this.isAuthenticated;
  }

  get user() {
      return this.userData;
  }

  set authStatus(status) {
      this.isAuthenticated = status;
  }

  set user(data) {
      this.userData = data;
  }

  async tryLogin(data) {
      try {
          const resp = await AuthenticationClient(data);

          runInAction(() => {
              this.authStatus = true;
              this.user = resp;
              localStorage.setItem('authStore', JSON.stringify(this));
          });
      } catch (e) {
          runInAction(() => {
              this.authStatus = false;
              this.user = null;
          });
      }
  }
}

export const authStore = new AuthStore(localStorage.getItem('authStore'));

autorun(() => {
    localStorage.setItem('authStore', JSON.stringify(authStore));
});
