// src/store/services/categoryApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* ===================== Types ===================== */
export interface Category {
    _id: string;
    name: string;
    type: 'service' | string; // keep open in case you extend on backend
    createdBy?: string | { _id: string; name?: string } | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryRequest {
    name: string;
    type?: 'service' | string; // backend defaults to 'service'
}

export interface UpdateCategoryRequest {
    id: string;
    data: Partial<Pick<Category, 'name' | 'type'>>;
}

export interface CategoryListResponse {
    status: string;
    data: Category[];
    total: number;
    page: number;
    pages: number;
}

export type CategoryQuery = {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
};

/* ================= Shared baseQuery ================= */
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

/* ===================== API ===================== */
export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery,
    tagTypes: ['Category'],
    endpoints: (builder) => ({
        // Create
        createCategory: builder.mutation<Category, CreateCategoryRequest>({
            query: (body) => ({
                url: '/categories',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Category'],
        }),

        // List (safe params typing; default to {} to avoid "void" leaking into params)
        getCategories: builder.query<CategoryListResponse, CategoryQuery | undefined>({
            query: (params: CategoryQuery = {}) => ({
                url: '/categories',
                params, // {} | filtered values — always a Record, never void
            }),
            transformResponse: (res: CategoryListResponse) => res,
            providesTags: ['Category'],
        }),

        // Read one
        getCategory: builder.query<Category, string>({
            query: (id) => `/categories/${id}`,
            providesTags: ['Category'],
        }),

        // Update (PATCH)
        updateCategory: builder.mutation<Category, UpdateCategoryRequest>({
            query: ({ id, data }) => ({
                url: `/categories/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),

        // Delete
        deleteCategory: builder.mutation<void, string>({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
});

export const {
    useCreateCategoryMutation,
    useGetCategoriesQuery,
    useGetCategoryQuery,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
