// src/slices/partnersReviewApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types
   ========================= */
export type PublishStatus = 'draft' | 'published';

export interface PRUserRef {
    _id: string;
    name?: string;
    email?: string;
}

export interface PartnersReviewItem {
    image?: string | File | null; // URL or File (when creating/updating)
    title?: string;               // optional short subject
    message: string;
    authorName: string;
    starsNo: number;              // 1..5
}

export interface PartnersReview {
    _id: string;
    title: string;
    description?: string;
    status: PublishStatus;
    items: Omit<PartnersReviewItem, 'image'> & { image?: string | null }[]; // server returns URLs/strings
    createdBy?: PRUserRef | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type PartnersReviewListResponse = {
    status: 'success';
    data: PartnersReview[];
    total: number;
    page: number;
    pages: number;
};

export type GetPartnersReviewsQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    status: PublishStatus;
    sort: 'createdAt';
}>;

/* =========================
   Create / Update payloads
   ========================= */
type Fileish = File | string | null | undefined;

export type CreatePartnersReviewRequest = {
    title: string;
    description?: string;
    status?: PublishStatus;
    items?: PartnersReviewItem[]; // image can be File or URL
};

export type UpdatePartnersReviewRequest = {
    id: string;
    data: Partial<CreatePartnersReviewRequest>;
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
 * Build FormData compatible with the server’s `mapFilesIntoBody`:
 * - items[i][image] supports File uploads
 * - items[i][message], items[i][authorName], items[i][starsNo], items[i][title]
 * - Scalars are appended directly
 */
function toFormDataForPartnersReview(
    payload: CreatePartnersReviewRequest | UpdatePartnersReviewRequest['data']
): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            // send empty string to signal clearing
            fd.append(key, '');
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val) || (val && typeof val === 'object')) {
            // For top-level objects *except* items (we handle items explicitly)
            // fall back to JSON if not items
            if (key !== 'items') {
                fd.append(key, JSON.stringify(val));
            }
        } else {
            fd.append(key, String(val));
        }
    };

    // Scalars
    appendIfDefined('title', (payload as any).title);
    appendIfDefined('description', (payload as any).description);
    appendIfDefined('status', (payload as any).status);

    // Items: expand as items[i][...]
    const items = (payload as any).items as PartnersReviewItem[] | undefined;
    if (Array.isArray(items)) {
        items.forEach((it, i) => {
            const base = `items[${i}]`;
            if (!it) return;
            const { image, title, message, authorName, starsNo } = it;

            if (image !== undefined && image !== null) {
                if (typeof File !== 'undefined' && image instanceof File) {
                    fd.append(`${base}[image]`, image);
                } else {
                    fd.append(`${base}[image]`, String(image));
                }
            }
            if (title !== undefined) fd.append(`${base}[title]`, String(title ?? ''));
            if (message !== undefined) fd.append(`${base}[message]`, String(message ?? ''));
            if (authorName !== undefined) fd.append(`${base}[authorName]`, String(authorName ?? ''));
            if (starsNo !== undefined) fd.append(`${base}[starsNo]`, String(starsNo ?? ''));
        });
    } else if ((payload as any).items !== undefined) {
        // If dev passes a non-array object for items (rare), just JSON it
        appendIfDefined('items', (payload as any).items);
    }

    return fd;
}

/* =========================
   API
   ========================= */
export const partnersReviewApi = createApi({
    reducerPath: 'partnersReviewApi',
    baseQuery,
    tagTypes: ['PartnersReview', 'PartnersReviewList'],
    endpoints: (builder) => ({
        // LIST (public)
        getPartnersReviews: builder.query<PartnersReviewListResponse, GetPartnersReviewsQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/partners-reviews${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: PartnersReviewListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'PartnersReviewList', id: 'LIST' },
                        ...result.data.map((d) => ({ type: 'PartnersReview' as const, id: d._id })),
                    ]
                    : [{ type: 'PartnersReviewList', id: 'LIST' }],
        }),

        // GET (public)
        getPartnersReview: builder.query<PartnersReview, string>({
            query: (id) => `/partners-reviews/${id}`,
            transformResponse: (resp: { status: string; data: PartnersReview }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'PartnersReview', id }],
        }),

        // CREATE (protected; supports multipart for items[i][image])
        createPartnersReview: builder.mutation<PartnersReview, CreatePartnersReviewRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile(body as any);
                if (useMultipart) {
                    const fd = toFormDataForPartnersReview(body);
                    return { url: '/partners-reviews', method: 'POST', body: fd };
                }
                // JSON path (images must be URLs)
                return { url: '/partners-reviews', method: 'POST', body };
            },
            transformResponse: (resp: { status: string; data: PartnersReview }) => resp.data,
            invalidatesTags: [{ type: 'PartnersReviewList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart for items[i][image])
        updatePartnersReview: builder.mutation<PartnersReview, UpdatePartnersReviewRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile(data as any);
                if (useMultipart) {
                    const fd = toFormDataForPartnersReview(data);
                    return { url: `/partners-reviews/${id}`, method: 'PATCH', body: fd };
                }
                return { url: `/partners-reviews/${id}`, method: 'PATCH', body: data };
            },
            transformResponse: (resp: { status: string; data: PartnersReview }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'PartnersReview', id },
                { type: 'PartnersReviewList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deletePartnersReview: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/partners-reviews/${id}`, method: 'DELETE' }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'PartnersReview', id },
                { type: 'PartnersReviewList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetPartnersReviewsQuery,
    useGetPartnersReviewQuery,
    useCreatePartnersReviewMutation,
    useUpdatePartnersReviewMutation,
    useDeletePartnersReviewMutation,
} = partnersReviewApi;
