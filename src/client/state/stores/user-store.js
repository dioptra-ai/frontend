import {makeAutoObservable} from 'mobx';

import authenticationClient from 'clients/authentication';
import userClient from 'clients/user';
import {identify, resetTracking} from 'helpers/tracking';

class UserStore {
    _userData = null;

    constructor() {
        makeAutoObservable(this);
    }

    async initialize() {

        try {
            this.userData = await authenticationClient('login');
        } catch (e) {
            if (e.message.startsWith('Unauthorized') && !['/login', '/register'].includes(window.location.pathname)) {
                window.location = '/login';
            }

            this.userData = null;
        }
    }

    get isAuthenticated() {

        return Boolean(this.userData);
    }

    get userData() {
        return this._userData;
    }

    set userData(data) {

        if (data !== this._userData) {
            if (data) {
                identify(data.username);
            } else {
                resetTracking();
            }
        }

        this._userData = data;
    }

    async tryLogin(data) {
        this.userData = await authenticationClient('login', data);
        window.location.reload();
    }

    async tryLogout() {
        await authenticationClient('logout');
        this.userData = null;
    }

    async tryUpdate(data) {
        this.userData = await userClient('put', data);
    }

    async tryRegister(data) {
        this.userData = await userClient('post', data);
        this.tryLogin(data);
    }
}

export const userStore = new UserStore();
