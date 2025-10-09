import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';
import { getAuthTokenFromCookie, setAuthTokenCookie, clearAuthTokenCookie } from '@/lib/authCookies';

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthResponse {
    user: {
        _id: string;
        name: string;
        email: string;
        status?: string;
        createdAt?: string;
        updatedAt?: string;
        role: string;
    };
    token: string;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const token = getAuthTokenFromCookie();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                const { data } = await queryFulfilled;
                const token = data?.token;
                if (token) setAuthTokenCookie(token);
            },
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: '/users/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation<void, void>({
            queryFn: () => {
                clearAuthTokenCookie();
                return { data: undefined };
            },
            invalidatesTags: ['Auth'],
        }),
        checkAuth: builder.query<{ isAuthenticated: boolean }, void>({
            query: () => '/users/auth/check',
            providesTags: ['Auth'],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useCheckAuthQuery } = authApi;


