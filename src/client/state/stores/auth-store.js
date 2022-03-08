import {makeAutoObservable} from 'mobx';
import authenticationClient from 'clients/authentication';
import userClient from 'clients/user';

class AuthStore {
    _isAuthenticated = false;

    _userData = null;

    _error = null;

    _loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async initialize() {
        this.loading = true;

        try {
            this.userData = await authenticationClient('login');
            this.isAuthenticated = true;
        } catch (e) {
            console.warn(e);
        } finally {
            this.loading = false;
        }
    }

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    get userData() {
        return this._userData;
    }

    get error() {
        return this._error;
    }

    get loading() {
        return this._loading;
    }

    get success() {
        return !this._error;
    }

    set isAuthenticated(status) {
        this._isAuthenticated = status;
    }

    set userData(data) {
        this._userData = data;
    }

    set error(err) {
        this._error = err;
    }

    set loading(status) {
        this._loading = status;
    }

    async tryLogin(data) {
        this.loading = true;
        this.error = null;

        try {
            this.userData = await authenticationClient('login', data);
            window.location.reload();
        } catch (e) {
            this.userData = null;
            this.isAuthenticated = false;
            this.error = e.message;
        } finally {
            this.loading = false;
        }
    }

    async tryLogout() {
        this.loading = true;
        this.error = null;

        try {
            await authenticationClient('logout');
            this.userData = null;
            this.isAuthenticated = false;
        } catch (e) {
            this.error = e;
        } finally {
            this.loading = false;
        }
    }

    async tryUpdate(data) {
        this.loading = true;
        this.error = null;

        try {
            this.userData = await userClient('put', data);
        } catch (e) {
            this.error = e;
        } finally {
            this.loading = false;
        }
    }

    async tryRegister(data) {
        this.loading = true;
        this.error = null;

        try {
            this.userData = await userClient('post', data);
            this.tryLogin(data);
        } catch (e) {
            this.error = e;
        } finally {
            this.loading = false;
        }
    }
}

export const authStore = new AuthStore();
