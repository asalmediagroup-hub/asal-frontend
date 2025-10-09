// src/store/services/rolesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types aligned to Mongoose
   ========================= */

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export const ACTIONS: Action[] = ['create', 'read', 'update', 'delete', 'manage'];

export interface Permission {
    subject: string;      // e.g., "users", "roles", "reports"
    actions: Action[];    // enum in schema: ["create","read","update","delete","manage"]
}

export interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: Permission[];      // default: []
    createdBy?: string | null;      // ObjectId ref -> expose as string
    createdAt?: string;             // timestamps: true
    updatedAt?: string;
}

/** Requests */
export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissions?: Permission[];     // optional; backend default []
    // createdBy is inferred from auth on backend; omit here
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    permissions?: Permission[];
}

/** Optional list params (if your backend supports them) */
export interface GetRolesQuery {
    page?: number;                  // default handled by backend
    limit?: number;                 // default handled by backend
    search?: string;                // e.g. by name/description
    sort?: string;                  // e.g. "-createdAt" or "name"
}

/** Common paged response */
export interface PagedResponse<T> {
    status: string;                 // e.g., "success"
    data: T[];
    total: number;
    page: number;
    pages: number;
}

/* =========================
   Base Query (auth cookie)
   ========================= */

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
        const match =
            typeof document !== 'undefined'
                ? document.cookie.match(/(?:^|; )token=([^;]*)/)
                : null;
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return headers;
    },
    credentials: 'include',
});

/* =========================
   Roles API (CRUD + perms)
   ========================= */

export const rolesApi = createApi({
    reducerPath: 'rolesApi',
    baseQuery,
    tagTypes: ['Role'],
    endpoints: (builder) => ({
        /** Create */
        createRole: builder.mutation<Role, CreateRoleRequest>({
            query: (body) => ({
                url: '/roles',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Role', id: 'LIST' }],
        }),

        /** List (with optional params) */
        getRoles: builder.query<PagedResponse<Role>, GetRolesQuery | void>({
            query: (params) => ({
                url: '/roles',
                params: params ?? {},
            }),
            transformResponse: (res: PagedResponse<Role>) => res,
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map((r) => ({ type: 'Role' as const, id: r._id })),
                        { type: 'Role' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Role' as const, id: 'LIST' }],
        }),

        /** Read one */
        getRole: builder.query<Role, string>({
            query: (id) => `/roles/${id}`,
            providesTags: (_res, _err, id) => [{ type: 'Role', id }],
        }),

        /** Update (partial) */
        updateRole: builder.mutation<Role, { id: string; data: UpdateRoleRequest }>({
            query: ({ id, data }) => ({
                url: `/roles/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_res, _err, arg) => [
                { type: 'Role', id: arg.id },
                { type: 'Role', id: 'LIST' },
            ],
        }),

        /** Delete */
        deleteRole: builder.mutation<{ status: string }, string>({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Role', id },
                { type: 'Role', id: 'LIST' },
            ],
        }),

        /** (Optional) Replace entire permissions array */
        setRolePermissions: builder.mutation<Role, { id: string; permissions: Permission[] }>(
            {
                query: ({ id, permissions }) => ({
                    url: `/roles/${id}/permissions`,
                    method: 'PUT',
                    body: { permissions },
                }),
                invalidatesTags: (_res, _err, arg) => [
                    { type: 'Role', id: arg.id },
                    { type: 'Role', id: 'LIST' },
                ],
            }
        ),
    }),
});

export const {
    useCreateRoleMutation,
    useGetRolesQuery,
    useGetRoleQuery,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useSetRolePermissionsMutation,
} = rolesApi;
