import {makeAutoObservable} from 'mobx';

import authenticationClient from 'clients/authentication';
import {identify, group, resetTracking} from 'helpers/tracking';
import baseJSONClient from 'clients/base-json-client';

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

    get hasActiveOrganization() {

        return Boolean(this.userData?.activeOrganizationMembership);
    }

    get userData() {
        return this._userData;
    }

    set userData(data) {

        if (data !== this._userData) {
            if (data) {
                identify(data.username);
                group(data.activeOrganizationMembership?.organization?.name)
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
        this.userData = await baseJSONClient.put('/api/user', data);
    }

    async tryRegister(data, token) {
        this.userData = await baseJSONClient.post('/api/user', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        this.tryLogin(data);
    }
}

export const userStore = new UserStore();
