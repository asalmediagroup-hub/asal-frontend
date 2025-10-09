// src/slices/packageApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/lib/baseURL';

/* =========================
   Types
   ========================= */
export type PackageSlug = 'religious' | 'social' | 'news' | 'sports';
export type PublishStatus = 'draft' | 'published';

export type PackageCategory =
    | 'Ramadan'
    | 'Quran'
    | 'Scholars'
    | 'Charity'
    | 'Education'
    | 'Iftar'
    | 'Initiative'
    | 'Youth'
    | 'Women'
    | 'Campaign'
    | 'Diaspora'
    | 'Volunteer'
    | 'Interfaith'
    | 'Platform Launch'
    | 'Award'
    | 'Production'
    | 'Expansion'
    | 'Digital'
    | 'Partnership'
    | 'Infrastructure'
    | 'Football'
    | 'Basketball'
    | 'Athletics'
    | 'Community'
    | 'Volleyball'
    | 'Festival';

export interface PackageUserRef {
    _id: string;
    name?: string;
    email?: string;
}

export interface FeaturedStory {
    image?: string | File | null; // URL or File; server supports featuredStories[i][image]
    title: string;
    description: string;
    author: string;
    date: string;                 // ISO string or plain date text
    fullVersion: string;          // full story content
}

export interface PackageDoc {
    _id: string;
    title: string;
    description: string;
    slug: PackageSlug;
    status: PublishStatus;
    category: PackageCategory;
    featuredStories: Omit<FeaturedStory, 'image'> & { image?: string | null }[];

    createdBy?: PackageUserRef | string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type PackageListResponse = {
    status: 'success';
    data: PackageDoc[];
    total: number;
    page: number;
    pages: number;
};

export type GetPackagesQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    status: PublishStatus;
    slug: PackageSlug | string;
    category: PackageCategory | string;
    sort: 'createdAt';
}>;

/* =========================
   Create / Update payloads
   ========================= */
type Fileish = File | string | null | undefined;

export type CreatePackageRequest = {
    title: string;
    description: string;
    slug: PackageSlug;
    status?: PublishStatus;
    category: PackageCategory;

    // Array of stories; images can be URLs or Files
    featuredStories?: FeaturedStory[];
};

export type UpdatePackageRequest = {
    id: string;
    data: Partial<CreatePackageRequest>;
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

function toFormDataForPackage(
    payload: CreatePackageRequest | UpdatePackageRequest['data']
): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            fd.append(key, '');
            return;
        }
        if (typeof File !== 'undefined' && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val) || typeof val === 'object') {
            fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    };

    // Scalars
    appendIfDefined('title', (payload as any).title);
    appendIfDefined('description', (payload as any).description);
    appendIfDefined('slug', (payload as any).slug);
    appendIfDefined('status', (payload as any).status);
    appendIfDefined('category', (payload as any).category);

    // featuredStories — supports files for featuredStories[i][image]
    const stories = (payload as any).featuredStories as FeaturedStory[] | undefined;
    if (Array.isArray(stories)) {
        stories.forEach((it, i) => {
            if (!it) return;
            const base = `featuredStories[${i}]`;

            const { image, title, description, author, date, fullVersion } = it;

            if (image !== undefined && image !== null) {
                if (typeof File !== 'undefined' && image instanceof File) {
                    fd.append(`${base}[image]`, image);
                } else {
                    fd.append(`${base}[image]`, String(image));
                }
            }
            if (title !== undefined) fd.append(`${base}[title]`, String(title ?? ''));
            if (description !== undefined)
                fd.append(`${base}[description]`, String(description ?? ''));
            if (author !== undefined) fd.append(`${base}[author]`, String(author ?? ''));
            if (date !== undefined) fd.append(`${base}[date]`, String(date ?? ''));
            if (fullVersion !== undefined)
                fd.append(`${base}[fullVersion]`, String(fullVersion ?? ''));
        });
    }

    return fd;
}

/* =========================
   API
   ========================= */
export const packageApi = createApi({
    reducerPath: 'packageApi',
    baseQuery,
    tagTypes: ['Package', 'PackageList'],
    endpoints: (builder) => ({
        // LIST (public)
        getPackages: builder.query<PackageListResponse, GetPackagesQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/packages${qstr ? `?${qstr}` : ''}`;
            },
            transformResponse: (resp: PackageListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: 'PackageList', id: 'LIST' },
                        ...result.data.map((p) => ({ type: 'Package' as const, id: p._id })),
                    ]
                    : [{ type: 'PackageList', id: 'LIST' }],
        }),

        // GET (public)
        getPackage: builder.query<PackageDoc, string>({
            query: (id) => `/packages/${id}`,
            transformResponse: (resp: { status: string; data: PackageDoc }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: 'Package', id }],
        }),

        // CREATE (protected; supports multipart for featuredStories[i][image])
        createPackage: builder.mutation<PackageDoc, CreatePackageRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile(body);
                if (useMultipart) {
                    const fd = toFormDataForPackage(body);
                    return { url: '/packages', method: 'POST', body: fd };
                }
                return { url: '/packages', method: 'POST', body };
            },
            transformResponse: (resp: { status: string; data: PackageDoc }) => resp.data,
            invalidatesTags: [{ type: 'PackageList', id: 'LIST' }],
        }),

        // UPDATE (protected; supports multipart for featuredStories[i][image])
        updatePackage: builder.mutation<PackageDoc, UpdatePackageRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile(data);
                if (useMultipart) {
                    const fd = toFormDataForPackage(data);
                    return { url: `/packages/${id}`, method: 'PATCH', body: fd };
                }
                return { url: `/packages/${id}`, method: 'PATCH', body: data };
            },
            transformResponse: (resp: { status: string; data: PackageDoc }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: 'Package', id },
                { type: 'PackageList', id: 'LIST' },
            ],
        }),

        // DELETE (protected)
        deletePackage: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/packages/${id}`, method: 'DELETE' }),
            invalidatesTags: (_res, _err, id) => [
                { type: 'Package', id },
                { type: 'PackageList', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetPackagesQuery,
    useGetPackageQuery,
    useCreatePackageMutation,
    useUpdatePackageMutation,
    useDeletePackageMutation,
} = packageApi;
