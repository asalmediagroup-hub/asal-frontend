// src/slices/brandApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types
   ========================= */
export type BrandSlug = 'asal-tv' | 'jiil-media' | 'masrax-production' | 'nasiye';
export type PublishStatus = 'draft' | 'published';

export interface BrandUserRef {
    _id: string;
    name?: string;
    email?: string;
}

export interface BrandFeaturedItem {
    image?: string | null;         // URL (server expects URL for array items)
    title: string;
    description?: string;
    href?: string;                 // default '#'
    order?: number;
}

export interface BrandPlatformFeature {
    image?: string | null;         // URL
    title: string;
    description?: string;
}

export interface BrandContentCategory {
    title: string;
    subtitle?: string;
}

export interface BrandUserReview {
    stars: number;                 // 1..5
    message: string;
    person: string;
}

export interface Brand {
    _id: string;
    name: string;
    slug: BrandSlug;
    status: PublishStatus;
    order: number;
    themeKey?: string;

    // Hero
    heroTitle?: string;
    heroDescription?: string;
    heroBgImage?: string | null;          // URL to bg image (desktop)
    heroBgImageMobile?: string | null;    // optional mobile bg

    // About
    aboutTitle?: string;
    aboutDescription?: string;
    aboutImage?: string | null;

    // Featured (Asal/Jiil/Masrax)
    featuredDescription?: string;
    featuredItems?: BrandFeaturedItem[];

    // Nasiye-only (optional for others)
    platformFeaturesDescription?: string;
    platformFeatures?: BrandPlatformFeature[];

    contentCategoriesDescription?: string;
    contentCategories?: BrandContentCategory[];

    screenshotTitle?: string;
    screenshotImage?: string | null;

    reviewsTitle?: string;
    userReviews?: BrandUserReview[];

    createdBy?: BrandUserRef | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type BrandListResponse = {
    status: 'success';
    data: Brand[];
    total: number;
    page: number;
    pages: number;
};

export type GetBrandsQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    status: PublishStatus;
    slug: BrandSlug | string;
    sort: 'order' | 'createdAt';
}>;

/* =========================
   Create / Update payloads
   Note: Arrays (featuredItems, etc.) should contain URLs for images.
   File uploads are supported ONLY for top-level single-image fields:
   heroBgImage, heroBgImageMobile, aboutImage, screenshotImage.
   ========================= */
type Fileish = File | string | null | undefined;

export type CreateBrandRequest = {
    name: string;
    slug: BrandSlug;
    status?: PublishStatus;
    order?: number;
    themeKey?: string;

    heroTitle?: string;
    heroDescription?: string;
    heroBgImage?: Fileish;             // File -> multipart; string URL -> JSON; null -> set null
    heroBgImageMobile?: Fileish;       // optional
    aboutTitle?: string;
    aboutDescription?: string;
    aboutImage?: Fileish;

    featuredDescription?: string;
    featuredItems?: BrandFeaturedItem[];          // images here should be URLs

    // Nasiye-only (optional safe everywhere)
    platformFeaturesDescription?: string;
    platformFeatures?: BrandPlatformFeature[];

    contentCategoriesDescription?: string;
    contentCategories?: BrandContentCategory[];

    screenshotTitle?: string;
    screenshotImage?: Fileish;

    reviewsTitle?: string;
    userReviews?: BrandUserReview[];
};

export type UpdateBrandRequest = {
    id: string;
    data: Partial<CreateBrandRequest>;
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

function toFormDataForBrand(payload: CreateBrandRequest | UpdateBrandRequest['data']): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            // send empty string to signal "clear" for nullable strings
            fd.append(key, '');
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val) || typeof val === 'object') {
            // fallback JSON for unknown nested types (no files inside)
            fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    };

    // scalar fields
    appendIfDefined('name', (payload as any).name);
    appendIfDefined('slug', (payload as any).slug);
    appendIfDefined('status', (payload as any).status);
    appendIfDefined('order', (payload as any).order);
    appendIfDefined('themeKey', (payload as any).themeKey);

    // hero / about text
    appendIfDefined('heroTitle', (payload as any).heroTitle);
    appendIfDefined('heroDescription', (payload as any).heroDescription);
    appendIfDefined('aboutTitle', (payload as any).aboutTitle);
    appendIfDefined('aboutDescription', (payload as any).aboutDescription);

    // file-able single images
    appendIfDefined('heroBgImage', (payload as any).heroBgImage);
    appendIfDefined('heroBgImageMobile', (payload as any).heroBgImageMobile);
    appendIfDefined('aboutImage', (payload as any).aboutImage);
    appendIfDefined('screenshotImage', (payload as any).screenshotImage);

    // featured (arrays) — support binary for featuredItems[i][image]
    appendIfDefined('featuredDescription', (payload as any).featuredDescription);
    const featuredItems = (payload as any).featuredItems;
    if (Array.isArray(featuredItems)) {
        featuredItems.forEach((it: any, i: number) => {
            const base = `featuredItems[${i}]`;
            if (it === undefined || it === null) return;
            const { image, title, description, href, order } = it || {};
            if (image !== undefined && image !== null) {
                if (typeof File !== 'undefined' && image instanceof File) {
                    fd.append(`${base}[image]`, image);
                } else {
                    fd.append(`${base}[image]`, String(image));
                }
            }
            if (title !== undefined) fd.append(`${base}[title]`, String(title ?? ''));
            if (description !== undefined) fd.append(`${base}[description]`, String(description ?? ''));
            if (href !== undefined) fd.append(`${base}[href]`, String(href ?? ''));
            if (order !== undefined) fd.append(`${base}[order]`, String(order ?? '0'));
        });
    }

    // Nasiye-only sections (safe everywhere)
    appendIfDefined('platformFeaturesDescription', (payload as any).platformFeaturesDescription);
    // platformFeatures (no files expected) — JSON fallback
    appendIfDefined('platformFeatures', (payload as any).platformFeatures);

    appendIfDefined('contentCategoriesDescription', (payload as any).contentCategoriesDescription);
    appendIfDefined('contentCategories', (payload as any).contentCategories);

    appendIfDefined('screenshotTitle', (payload as any).screenshotTitle);

    appendIfDefined('reviewsTitle', (payload as any).reviewsTitle);
    appendIfDefined('userReviews', (payload as any).userReviews);

    return fd;
}

/* =========================
   API
   ========================= */
export const brandApi = createApi({
    reducerPath: 'brandApi',
    baseQuery,
    tagTypes: ['Brand', 'BrandList'],
    endpoints: (builder) => ({
        // LIST (public)
        getBrands: builder.query<BrandListResponse, GetBrandsQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/brands${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: BrandListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'BrandList', id: 'LIST' },
                        ...result.data.map((b) => ({ type: 'Brand' as const, id: b._id })),
                    ]
                    : [{ type: 'BrandList', id: 'LIST' }],
        }),

        // GET (public)
        getBrand: builder.query<Brand, string>({
            query: (id) => `/brands/${id}`,
            transformResponse: (resp: { status: string; data: Brand }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'Brand', id }],
        }),

        // CREATE (protected; supports multipart for top-level single images)
        createBrand: builder.mutation<Brand, CreateBrandRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile(body as any);
                if (useMultipart) {
                    const fd = toFormDataForBrand(body);
                    return { url: '/brands', method: 'POST', body: fd };
                }
                // JSON path (top-level images should be URLs or null if you want to clear)
                return { url: '/brands', method: 'POST', body };
            },
            transformResponse: (resp: { status: string; data: Brand }) => resp.data,
            invalidatesTags: [{ type: 'BrandList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart for top-level single images)
        updateBrand: builder.mutation<Brand, UpdateBrandRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile(data as any);
                if (useMultipart) {
                    const fd = toFormDataForBrand(data);
                    return { url: `/brands/${id}`, method: 'PATCH', body: fd };
                }
                return { url: `/brands/${id}`, method: 'PATCH', body: data };
            },
            transformResponse: (resp: { status: string; data: Brand }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'Brand', id },
                { type: 'BrandList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deleteBrand: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/brands/${id}`, method: 'DELETE' }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Brand', id },
                { type: 'BrandList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetBrandsQuery,
    useGetBrandQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
} = brandApi;
