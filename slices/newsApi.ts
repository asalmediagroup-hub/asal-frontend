// src/slices/newsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types
   ========================= */
export type PublishStatus = 'draft' | 'published';

export interface NewsUserRef {
    _id: string;
    name?: string;
    email?: string;
}

export interface NewsItem {
    date: string;                 // ISO string
    author?: string;              // defaults server-side to "News Desk"
    title: string;
    image?: string | File | null; // URL or File (when creating/updating)
    description?: string;
    fullNews: string;             // full body or HTML
    order?: number;
}

export interface NewsDoc {
    _id: string;
    title: string;
    description?: string;
    status: PublishStatus;
    order: number;

    items: Omit<NewsItem, 'image'> & { image?: string | null }[]; // normalized from server (URLs)

    createdBy?: NewsUserRef | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type NewsListResponse = {
    status: 'success';
    data: NewsDoc[];
    total: number;
    page: number;
    pages: number;
};

export type GetNewsQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    status: PublishStatus;
    sort: 'order' | 'createdAt' | 'updatedAt';
}>;

/* =========================
   Create / Update payloads
   Note: For uploads, pass File in items[i].image to use multipart.
   ========================= */
type Fileish = File | string | null | undefined;

export type CreateNewsRequest = {
    title: string;
    description?: string;
    status?: PublishStatus;
    order?: number;
    items?: NewsItem[]; // if image is File, multipart is used
};

export type UpdateNewsRequest = {
    id: string;
    data: Partial<CreateNewsRequest>;
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
 * Build FormData for News:
 * - Scalars: title, description, status, order
 * - Items array: uses bracket notation items[i][key]
 * - If items[i].image is File -> append as binary
 *   else if it's a string URL -> append as string
 */
function toFormDataForNews(payload: CreateNewsRequest | UpdateNewsRequest['data']): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            fd.append(key, ''); // signal "clear" for nullable strings
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val) || typeof val === 'object') {
            // We specifically handle items below; for any other nested object, fallback to JSON
            if (key !== 'items') fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    };

    // Scalars
    appendIfDefined('title', (payload as any).title);
    appendIfDefined('description', (payload as any).description);
    appendIfDefined('status', (payload as any).status);
    appendIfDefined('order', (payload as any).order);

    // Items (explicit handling)
    const items = (payload as any).items as NewsItem[] | undefined;
    if (Array.isArray(items)) {
        items.forEach((it, i) => {
            const base = `items[${i}]`;
            if (!it) return;

            if (it.date !== undefined) fd.append(`${base}[date]`, String(it.date ?? ''));
            if (it.author !== undefined) fd.append(`${base}[author]`, String(it.author ?? ''));
            if (it.title !== undefined) fd.append(`${base}[title]`, String(it.title ?? ''));
            if (it.description !== undefined) fd.append(`${base}[description]`, String(it.description ?? ''));
            if (it.fullNews !== undefined) fd.append(`${base}[fullNews]`, String(it.fullNews ?? ''));
            if (it.order !== undefined) fd.append(`${base}[order]`, String(it.order ?? '0'));

            if (it.image !== undefined && it.image !== null) {
                if (typeof File !== 'undefined' && it.image instanceof File) {
                    fd.append(`${base}[image]`, it.image);
                } else {
                    fd.append(`${base}[image]`, String(it.image)); // URL or empty
                }
            }
        });
    }

    return fd;
}

/* =========================
   API
   ========================= */
export const newsApi = createApi({
    reducerPath: 'newsApi',
    baseQuery,
    tagTypes: ['News', 'NewsList'],
    endpoints: (builder) => ({
        // LIST (public)
        getNews: builder.query<NewsListResponse, GetNewsQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/news${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: NewsListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'NewsList', id: 'LIST' },
                        ...result.data.map((n) => ({ type: 'News' as const, id: n._id })),
                    ]
                    : [{ type: 'NewsList', id: 'LIST' }],
        }),

        // GET (public)
        getNewsById: builder.query<NewsDoc, string>({
            query: (id) => `/news/${id}`,
            transformResponse: (resp: { status: string; data: NewsDoc }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'News', id }],
        }),

        // CREATE (protected; supports multipart for items[i][image])
        createNews: builder.mutation<NewsDoc, CreateNewsRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile(body.items);
                if (useMultipart) {
                    const fd = toFormDataForNews(body);
                    return { url: '/news', method: 'POST', body: fd };
                }
                return { url: '/news', method: 'POST', body };
            },
            transformResponse: (resp: { status: string; data: NewsDoc }) => resp.data,
            invalidatesTags: [{ type: 'NewsList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart for items[i][image])
        updateNews: builder.mutation<NewsDoc, UpdateNewsRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile((data as any)?.items);
                if (useMultipart) {
                    const fd = toFormDataForNews(data);
                    return { url: `/news/${id}`, method: 'PATCH', body: fd };
                }
                return { url: `/news/${id}`, method: 'PATCH', body: data };
            },
            transformResponse: (resp: { status: string; data: NewsDoc }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'News', id },
                { type: 'NewsList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deleteNews: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/news/${id}`, method: 'DELETE' }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'News', id },
                { type: 'NewsList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetNewsQuery,
    useGetNewsByIdQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;
