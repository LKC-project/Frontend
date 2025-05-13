import {instance} from "./base.js";
import { defineStore } from 'pinia';

export const login = async (data) => {
    return instance.post("/auth/login", {
        email: data.email,
        password: data.password
    })
}

export const register = async (data) => {
    return instance.post("/auth/register", {
        email: data.email,
        name: data.name,
        password: data.password
    })
}

export const google = async (data) => {
    return await instance.post("/auth/google", {
        credential: data.credential,
    })
}

export const logout = async () => {
    return await instance.post("/auth/logout")
}


// ???????????????????????????
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),
    actions: {
        async logout() {
            try {
                await instance.post('/auth/logout');

                this.user = null;
                this.token = null;

                localStorage.removeItem('authToken');
                sessionStorage.removeItem('userData');

                this.$router.push('/login');

            } catch (error) {
                console.error('Error logging out:', error);
            }
        },
    },
});
