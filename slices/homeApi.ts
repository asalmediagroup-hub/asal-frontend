import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types
   ========================= */
export interface HomeUserRef {
    _id: string;
    name?: string;
    email?: string;
}

export interface ServicePreview {
    title: string;
    description: string;
    keyServices: string[];
}

export interface HomeDoc {
    _id: string;
    siteName: string;
    logoImage: string;
    brandsPreviewImage: string[]; // array of 4 image URLs
    servicesPreview: ServicePreview[]; // array of 4 services
    hero: string;
    title: string;
    description: string;
    createdBy?: HomeUserRef | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type HomeListResponse = {
    status: 'success';
    data: HomeDoc[];
    total: number;
    page: number;
    pages: number;
};

export type GetHomeQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    sort: 'createdAt' | 'updatedAt';
}>;

/* =========================
   Create / Update payloads
   Note: For uploads, pass File for images to use multipart.
   ========================= */
type Fileish = File | string | null | undefined;

export type CreateHomeRequest = {
    siteName: string;
    logoImage?: File | string | null;
    brandsPreviewImage?: (File | string | null)[]; // array of 4 images
    servicesPreview?: ServicePreview[];
    hero?: File | string | null;
    title: string;
    description: string;
};

export type UpdateHomeRequest = {
    id: string;
    data: Partial<CreateHomeRequest>;
};

/* =========================
   Base Query
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
   Helpers
   ========================= */
function hasAnyFile(value: unknown): boolean {
    if (typeof File !== 'undefined' && value instanceof File) return true;
    if (Array.isArray(value)) return value.some(hasAnyFile);
    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).some(hasAnyFile);
    }
    return false;
}

/**
 * Build FormData for Home:
 * - Scalars: siteName, title, description
 * - logoImage, hero: File or string URL
 * - brandsPreviewImage: array of 4 File or string URLs
 * - servicesPreview: array of 4 objects with title, description, keyServices
 */
function toFormDataForHome(payload: CreateHomeRequest | UpdateHomeRequest['data']): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            fd.append(key, ''); // signal "clear" for nullable strings
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val)) {
            // Handle arrays: brandsPreviewImage or servicesPreview
            if (val.length > 0 && (typeof val[0] === 'string' || val[0] instanceof File)) {
                // Array of images/files
                val.forEach((v, i) => {
                    if (v instanceof File) {
                        fd.append(`${key}[${i}]`, v);
                    } else if (typeof v === 'string') {
                        fd.append(`${key}[${i}]`, v);
                    }
                });
            } else {
                // Array of objects (servicesPreview)
                val.forEach((obj, i) => {
                    if (typeof obj === 'object' && obj !== null) {
                        Object.entries(obj).forEach(([k, v]) => {
                            if (Array.isArray(v)) {
                                v.forEach((item, j) => {
                                    fd.append(`${key}[${i}][${k}][${j}]`, String(item));
                                });
                            } else {
                                fd.append(`${key}[${i}][${k}]`, String(v));
                            }
                        });
                    }
                });
            }
        } else if (typeof val === 'object') {
            fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    };

    // Scalars
    appendIfDefined('siteName', (payload as any).siteName);
    appendIfDefined('title', (payload as any).title);
    appendIfDefined('description', (payload as any).description);

    // Images
    appendIfDefined('logoImage', (payload as any).logoImage);
    appendIfDefined('hero', (payload as any).hero);

    // Brands preview images (array of 4)
    const brandsImages = (payload as any).brandsPreviewImage;
    if (Array.isArray(brandsImages)) {
        brandsImages.forEach((img, i) => {
            appendIfDefined(`brandsPreviewImage[${i}]`, img);
        });
    }

    // Services preview (array of 4)
    const services = (payload as any).servicesPreview;
    if (Array.isArray(services)) {
        services.forEach((svc, i) => {
            if (svc.title !== undefined) fd.append(`servicesPreview[${i}][title]`, String(svc.title));
            if (svc.description !== undefined) fd.append(`servicesPreview[${i}][description]`, String(svc.description));
            if (Array.isArray(svc.keyServices)) {
                svc.keyServices.forEach((ks, j) => {
                    fd.append(`servicesPreview[${i}][keyServices][${j}]`, String(ks));
                });
            }
        });
    }

    return fd;
}

/* =========================
   API
   ========================= */
export const homeApi = createApi({
    reducerPath: 'homeApi',
    baseQuery,
    tagTypes: ['Home', 'HomeList'],
    endpoints: (builder) => ({
        // LIST (public)
        getHomes: builder.query<HomeListResponse, GetHomeQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/home${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: HomeListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'HomeList', id: 'LIST' },
                        ...result.data.map((h) => ({ type: 'Home' as const, id: h._id })),
                    ]
                    : [{ type: 'HomeList', id: 'LIST' }],
        }),

        // GET (public)
        getHomeById: builder.query<HomeDoc, string>({
            query: (id) => `/home/${id}`,
            transformResponse: (resp: { status: string; data: HomeDoc }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'Home', id }],
        }),

        // CREATE (protected; supports multipart for images)
        createHome: builder.mutation<HomeDoc, CreateHomeRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile([body.logoImage, body.hero, ...(body.brandsPreviewImage || [])]);
                if (useMultipart) {
                    const fd = toFormDataForHome(body);
                    return { url: '/home', method: 'POST', body: fd };
                }
                return { url: '/home', method: 'POST', body };
            },
            transformResponse: (resp: { status: string; data: HomeDoc }) => resp.data,
            invalidatesTags: [{ type: 'HomeList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart for images)
        updateHome: builder.mutation<HomeDoc, UpdateHomeRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile([data.logoImage, data.hero, ...(data.brandsPreviewImage || [])]);
                if (useMultipart) {
                    const fd = toFormDataForHome(data);
                    return { url: `/home/${id}`, method: 'PATCH', body: fd };
                }
                return { url: `/home/${id}`, method: 'PATCH', body: data };
            },
            transformResponse: (resp: { status: string; data: HomeDoc }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'Home', id },
                { type: 'HomeList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deleteHome: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/home/${id}`, method: 'DELETE' }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Home', id },
                { type: 'HomeList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetHomesQuery,
    useGetHomeByIdQuery,
    useCreateHomeMutation,
    useUpdateHomeMutation,
    useDeleteHomeMutation,
} = homeApi;
