import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

// ---- Types ----
export interface ServiceCategoryRef {
    _id: string;
    name?: string;
    slug?: string;
}

export interface Service {
    _id: string;
    category: ServiceCategoryRef | string; // server may populate or just return id
    title: string;
    description?: string;
    features: string[];
    image: string | null;
    order: number;
    status: 'draft' | 'published';
    createdBy?: { _id: string; name?: string; email?: string } | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type ServiceListResponse = {
    status: 'success';
    data: Service[];
    total: number;
    page: number;
    pages: number;
};

export type GetServicesQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    category: string; // category id
    status: 'draft' | 'published';
    sort: 'order' | 'createdAt';
}>;

// Accept both JSON and multipart: if image is File, we’ll send FormData
export type CreateServiceRequest = {
    title: string;
    description?: string;
    features?: string[]; // or comma string; we’ll stringify if JSON
    category: string; // category id
    order?: number;
    status?: 'draft' | 'published';
    image?: File | string | null; // File -> upload, string -> direct URL, null/undefined -> no/clear
};

export type UpdateServiceRequest = {
    id: string;
    data: Partial<Omit<CreateServiceRequest, 'category'>> & { category?: string };
};

// ---- Base query (same auth behavior as users slice) ----
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

// ---- Helpers ----
function hasFile(value: unknown): boolean {
    if (typeof File !== 'undefined' && value instanceof File) return true;
    if (Array.isArray(value)) return value.some(hasFile);
    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, unknown>).some(hasFile);
    }
    return false;
}

function toFormData(payload: Record<string, any>): FormData {
    const fd = new FormData();
    Object.entries(payload).forEach(([key, val]) => {
        if (val === undefined) return;
        if (val === null) {
            fd.append(key, '');
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val)) {
            // send arrays as repeated keys (features[]=a&features[]=b)
            val.forEach((v) => fd.append(`${key}[]`, String(v)));
        } else if (typeof val === 'object') {
            fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    });
    return fd;
}

// ---- API ----
export const servicesApi = createApi({
    reducerPath: 'servicesApi',
    baseQuery,
    tagTypes: ['Service', 'ServiceList'],
    endpoints: (builder) => ({
        // LIST (public)
        getServices: builder.query<ServiceListResponse, GetServicesQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/services${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: ServiceListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'ServiceList', id: 'LIST' },
                        ...result.data.map((s) => ({ type: 'Service' as const, id: s._id })),
                    ]
                    : [{ type: 'ServiceList', id: 'LIST' }],
        }),

        // GET (public)
        getService: builder.query<Service, string>({
            query: (id) => `/services/${id}`,
            transformResponse: (resp: { status: string; data: Service }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'Service', id }],
        }),

        // CREATE (protected; supports multipart)
        createService: builder.mutation<Service, CreateServiceRequest>({
            query: (body) => {
                const sendMultipart = hasFile(body.image);
                if (sendMultipart) {
                    const fd = toFormData({
                        title: body.title,
                        description: body.description ?? '',
                        category: body.category,
                        order: body.order ?? 0,
                        status: body.status ?? 'published',
                        // for arrays, our toFormData helper sends features[] entries
                        features: body.features ?? [],
                        image: body.image as File, // File path
                    });
                    return {
                        url: '/services',
                        method: 'POST',
                        body: fd,
                    };
                }
                // JSON path
                return {
                    url: '/services',
                    method: 'POST',
                    body: {
                        title: body.title,
                        description: body.description ?? '',
                        features: body.features ?? [],
                        category: body.category,
                        order: body.order ?? 0,
                        status: body.status ?? 'published',
                        // string URL or null/undefined handled server-side (null clears)
                        image: body.image ?? null,
                    },
                };
            },
            transformResponse: (resp: { status: string; data: Service }) => resp.data,
            invalidatesTags: [{ type: 'ServiceList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart)
        updateService: builder.mutation<Service, UpdateServiceRequest>({
            query: ({ id, data }) => {
                const sendMultipart = hasFile(data.image);
                if (sendMultipart) {
                    const fd = toFormData({
                        ...data,
                        // ensure features present if using multipart; default empty array
                        features: data.features ?? [],
                    });
                    return {
                        url: `/services/${id}`,
                        method: 'PATCH',
                        body: fd,
                    };
                }
                // JSON path
                return {
                    url: `/services/${id}`,
                    method: 'PATCH',
                    body: {
                        ...data,
                        // If you want to clear image: send image: null
                        // If you want to keep: omit image key entirely at callsite
                    },
                };
            },
            transformResponse: (resp: { status: string; data: Service }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'Service', id },
                { type: 'ServiceList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deleteService: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Service', id },
                { type: 'ServiceList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetServicesQuery,
    useGetServiceQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
} = servicesApi;
