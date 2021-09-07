import {makeAutoObservable} from 'mobx';
import authenticationClient from 'clients/authentication';
import userClient from 'clients/user';

class AuthStore {
    isAuthenticated = false;

    userData = null;

    error = null;

    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async init() {
        this.loading = true;

        try {
            this.userData = await authenticationClient('login');
            this.isAuthenticated = true;
        } finally {
            this.loading = false;
        }
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
        return !this.error;
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

    async tryLogin(data) {
        this.loading = true;
        this.error = null;

        try {
            this.userData = await authenticationClient('login', data);
            this.isAuthenticated = true;
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

authStore.init();
