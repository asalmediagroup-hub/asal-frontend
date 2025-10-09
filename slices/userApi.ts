import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: {
        _id: string;
        name: string;
        description?: string;
        permissions?: { subject: string; actions: string[] }[];
        createdBy?: string | null;
        createdAt?: string;
        updatedAt?: string;
    };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterRequest {
    username: string;
    fullName: string;
    email: string;
    password: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: string; // role _id
    status: string; // "active" | "suspended" | "inactive"
}

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
        // Send Bearer token if cookie exists — backend also reads cookie directly
        const match = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )token=([^;]*)/) : null;
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
    credentials: 'include',
});

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        createUser: builder.mutation<User, CreateUserRequest>({
            query: (userData) => ({
                url: '/users',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        register: builder.mutation<User, RegisterRequest>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        getUsers: builder.query<{ status: string; data: User[]; total: number; page: number; pages: number }, void>({
            query: () => '/users',
            transformResponse: (response: { status: string; data: User[]; total: number; page: number; pages: number }) => response,
            providesTags: ['User'],
        }),
        getUser: builder.query<User, string>({
            query: (id) => `/users/${id}`,
            providesTags: ['User'],
        }),
        updateUser: builder.mutation<User, { id: string; data: Partial<Omit<User, 'role'>> & { role?: string } }>({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const { useCreateUserMutation, useRegisterMutation, useGetUsersQuery, useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } = userApi;


