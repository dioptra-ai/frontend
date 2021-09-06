import {
    autorun,
    makeAutoObservable,
    runInAction
} from 'mobx';
import AuthenticationClient from 'clients/authentication';
import userClient from 'clients/user';

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

    get isAuthenticated() {
        return this.isAuthenticated;
    }

    get userData() {
        return this.userData;
    }

    get error() {
        return this.error;
    }

    get loading() {
        return this.loading;
    }

    get success() {
        return this.success;
    }

    set isAuthenticated(status) {
        this.isAuthenticated = status;
    }

    set userData(data) {
        this.userData = data;
    }

    set error(err) {
        this.error = err;
    }

    set loading(status) {
        this.loading = status;
    }

    set success(status) {
        this.success = status;
    }

    async tryLogin(data) {
        try {
            const resp = await AuthenticationClient('login', data);

            runInAction(() => {
                this.isAuthenticated = true;
                this.userData = resp;
                this.error = null;
            });
        } catch (e) {
            runInAction(() => {
                this.isAuthenticated = false;
                this.userData = null;
                this.error = e.message;
            });
        }
    }

    async tryLogout() {
        try {
            await AuthenticationClient('logout');
        } finally {
            runInAction(() => {
                this.isAuthenticated = false;
                this.userData = null;
                this.error = null;
            });
        }
    }

    async tryUpdate(data) {
        try {
            runInAction(() => {
                this.loading = true;
                this.success = false;
            });
            const resp = await userClient('put', data);

            runInAction(() => {
                this.userData = resp;
                this.success = true;
                this.loading = false;
            });
        } catch (e) {
            runInAction(() => {
                this.error = e.message;
                this.loading = false;
            });
        }
    }

    async tryRegister(data) {
        this.loading = true;
        this.success = false;
        this.error = null;

        try {
            this.userData = await userClient('post', data);

            this.success = true;

            this.tryLogin(data);
        } catch (e) {
            this.error = e.message;
        } finally {
            this.loading = false;
        }
    }
}

export const authStore = new AuthStore(localStorage.getItem('authStore'));

autorun(() => {
    localStorage.setItem('authStore', JSON.stringify(authStore));
});
