// src/slices/portfolioApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/lib/baseURL";

/* =========================
   Types
   ========================= */
export type PortfolioCategory =
    | "Documentary"
    | "Digital Content"
    | "Commercial"
    | "Streaming Content"
    | "Life Event"
    | "Web Series";

export interface PortfolioItem {
    date: string; // ISO string
    title: string;
    description: string;
    category: PortfolioCategory;
    image?: string | File | null; // URL or File (when creating/updating)
    video?: string;
    text?: string;
}

export interface PortfolioDoc {
    _id: string;
    title: string;
    description?: string;

    // normalized from server (URLs / nulls)
    items: (Omit<PortfolioItem, "image"> & { image?: string | null })[];

    createdAt?: string;
    updatedAt?: string;
}

export type PortfolioListResponse = {
    status: "success";
    data: PortfolioDoc[];
    total: number;
    page: number;
    pages: number;
};

export type GetPortfolioQuery = Partial<{
    page: number;
    limit: number;
    q: string;
    sort: "createdAt" | "updatedAt";
}>;

/* =========================
   Create / Update payloads
   ========================= */
export type CreatePortfolioRequest = {
    title: string;
    description?: string;
    items?: PortfolioItem[]; // if any item.image is File, we use multipart
};

export type UpdatePortfolioRequest = {
    id: string;
    data: Partial<CreatePortfolioRequest>;
};

/* =========================
   Base Query
   ========================= */
const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
        const match =
            typeof document !== "undefined"
                ? document.cookie.match(/(?:^|; )token=([^;]*)/)
                : null;
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
    credentials: "include",
});

/* =========================
   Helpers
   ========================= */
function hasAnyFile(value: unknown): boolean {
    if (typeof File !== "undefined" && value instanceof File) return true;
    if (Array.isArray(value)) return value.some(hasAnyFile);
    if (value && typeof value === "object") {
        return Object.values(value as Record<string, unknown>).some(hasAnyFile);
    }
    return false;
}

/**
 * Build FormData for Portfolio:
 * - Scalars: title, description
 * - Items array: uses bracket notation items[i][key]
 * - If items[i].image is File -> append as binary
 *   else if it's a string URL -> append as string
 */
function toFormDataForPortfolio(
    payload: CreatePortfolioRequest | UpdatePortfolioRequest["data"]
): FormData {
    const fd = new FormData();

    const appendIfDefined = (key: string, val: any) => {
        if (val === undefined) return;
        if (val === null) {
            fd.append(key, ""); // signal "clear" for nullable strings
            return;
        }
        if (typeof File !== "undefined" && val instanceof File) {
            fd.append(key, val);
        } else if (Array.isArray(val) || typeof val === "object") {
            if (key !== "items") fd.append(key, JSON.stringify(val));
        } else {
            fd.append(key, String(val));
        }
    };

    // Scalars
    appendIfDefined("title", (payload as any).title);
    appendIfDefined("description", (payload as any).description);

    // Items (explicit handling)
    const items = (payload as any).items as PortfolioItem[] | undefined;
    if (Array.isArray(items)) {
        items.forEach((it, i) => {
            const base = `items[${i}]`;
            if (!it) return;

            if (it.title !== undefined) fd.append(`${base}[title]`, String(it.title ?? ""));
            if (it.description !== undefined)
                fd.append(`${base}[description]`, String(it.description ?? ""));
            if (it.date !== undefined) fd.append(`${base}[date]`, String(it.date ?? ""));
            if (it.category !== undefined)
                fd.append(`${base}[category]`, String(it.category ?? ""));
            if (it.video !== undefined) fd.append(`${base}[video]`, String(it.video ?? ""));
            if (it.text !== undefined) fd.append(`${base}[text]`, String(it.text ?? ""));

            if (it.image !== undefined && it.image !== null) {
                if (typeof File !== "undefined" && it.image instanceof File) {
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
export const portfolioApi = createApi({
    reducerPath: "portfolioApi",
    baseQuery,
    tagTypes: ["Portfolio", "PortfolioList"],
    endpoints: (builder) => ({
        // LIST
        getPortfolio: builder.query<PortfolioListResponse, GetPortfolioQuery | void>({
            query: (params) => {
                const qs = new URLSearchParams();
                if (params) {
                    Object.entries(params).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
                    });
                }
                const qstr = qs.toString();
                return `/portfolio${qstr ? `?${qstr}` : ""}`;
            },
            transformResponse: (resp: PortfolioListResponse) => resp,
            providesTags: (result) =>
                result
                    ? [
                        { type: "PortfolioList", id: "LIST" },
                        ...result.data.map((p) => ({ type: "Portfolio" as const, id: p._id })),
                    ]
                    : [{ type: "PortfolioList", id: "LIST" }],
        }),

        // GET by id
        getPortfolioById: builder.query<PortfolioDoc, string>({
            query: (id) => `/portfolio/${id}`,
            transformResponse: (resp: { status: string; data: PortfolioDoc }) => resp.data,
            providesTags: (_res, _err, id) => [{ type: "Portfolio", id }],
        }),

        // CREATE (singleton on server; supports multipart for items[i][image])
        createPortfolio: builder.mutation<PortfolioDoc, CreatePortfolioRequest>({
            query: (body) => {
                const useMultipart = hasAnyFile(body.items);
                if (useMultipart) {
                    const fd = toFormDataForPortfolio(body);
                    return { url: "/portfolio", method: "POST", body: fd };
                }
                return { url: "/portfolio", method: "POST", body };
            },
            transformResponse: (resp: { status: string; data: PortfolioDoc }) => resp.data,
            invalidatesTags: [{ type: "PortfolioList", id: "LIST" }],
        }),

        // UPDATE (supports multipart for items[i][image])
        updatePortfolio: builder.mutation<PortfolioDoc, UpdatePortfolioRequest>({
            query: ({ id, data }) => {
                const useMultipart = hasAnyFile((data as any)?.items);
                if (useMultipart) {
                    const fd = toFormDataForPortfolio(data);
                    return { url: `/portfolio/${id}`, method: "PATCH", body: fd };
                }
                return { url: `/portfolio/${id}`, method: "PATCH", body: data };
            },
            transformResponse: (resp: { status: string; data: PortfolioDoc }) => resp.data,
            invalidatesTags: (_res, _err, { id }) => [
                { type: "Portfolio", id },
                { type: "PortfolioList", id: "LIST" },
            ],
        }),

        // DELETE
        deletePortfolio: builder.mutation<{ message: string }, string>({
            query: (id) => ({ url: `/portfolio/${id}`, method: "DELETE" }),
            invalidatesTags: (_res, _err, id) => [
                { type: "Portfolio", id },
                { type: "PortfolioList", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetPortfolioQuery,
    useGetPortfolioByIdQuery,
    useCreatePortfolioMutation,
    useUpdatePortfolioMutation,
    useDeletePortfolioMutation,
} = portfolioApi;
