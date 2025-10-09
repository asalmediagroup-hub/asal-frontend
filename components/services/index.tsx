"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./table";
import RecordModal from "./modal";
import {
    useGetServicesQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
} from "@/slices/serviceApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

// Types for the table rows shown in DataTable
// ------------------------------------------------
export interface RecordItem {
    id: string;
    title: string;          // service.title
    category: string;       // category name (populated) or fallback
    description?: string;
    categoryId?: string;    // category _id for submit
    status: "draft" | "published";
    author: string;         // createdBy name/email (display)
    date: string;           // createdAt (YYYY-MM-DD)
    order?: number;
    image?: string | null;  // preview only
    featuresPreview?: string; // short preview
}

export default function ManagementServices() {
    const { data, error, isLoading } = useGetServicesQuery({ page: 1, limit: 100, sort: "order" });
    const [createService] = useCreateServiceMutation();
    const [updateService] = useUpdateServiceMutation();
    const [deleteService] = useDeleteServiceMutation();

    const [pageAlert, setPageAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);

    const items: RecordItem[] = useMemo(() => {
        const list = data?.data ?? [];
        return list.map((s: any) => {
            const categoryName =
                (typeof s.category === "object" && (s.category?.name || s.category?.slug)) ||
                (typeof s.category === "string" ? s.category : "") ||
                "";
            const categoryId =
                (typeof s.category === "object" && s.category?._id) ||
                (typeof s.category === "string" ? s.category : undefined);

            const author =
                (typeof s.createdBy === "object" && (s.createdBy?.name || s.createdBy?.email)) ||
                (typeof s.createdBy === "string" ? s.createdBy : "") ||
                "";

            const createdAt = s.createdAt ? String(s.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10);

            return {
                id: s._id,
                title: s.title,
                category: String(categoryName),
                description: s.description || "",
                categoryId: categoryId,
                status: s.status || "published",
                author,
                date: createdAt,
                order: s.order ?? 0,
                image: s.image ?? null,
                featuresPreview: Array.isArray(s.features) ? s.features.slice(0, 3).join(", ") : "",
            } as RecordItem;
        });
    }, [data]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<RecordItem | null>(null);

    // delete confirm modal state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteItems, setPendingDeleteItems] = useState<RecordItem[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const onEdit = (item: RecordItem) => {
        setEditing(item);
        setModalOpen(true);
    };

    // 1) open confirm modal
    const onDelete = async (ids: string[]) => {
        const selected = items.filter((it) => ids.includes(it.id));
        if (!selected.length) return;
        setPendingDeleteItems(selected);
        setDeleteOpen(true);
    };

    // 2) confirm delete and call API
    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            await Promise.all(pendingDeleteItems.map((it) => deleteService(it.id).unwrap()));
            setPageAlert({
                type: "success",
                message:
                    pendingDeleteItems.length === 1
                        ? `Deleted "${pendingDeleteItems[0].title}" successfully.`
                        : `Deleted ${pendingDeleteItems.length} services successfully.`,
            });
        } catch (e: any) {
            const apiMsg = e?.data?.message || e?.message || "Delete failed";
            setPageAlert({ type: "error", message: apiMsg });
        } finally {
            setIsDeleting(false);
            setDeleteOpen(false);
            setPendingDeleteItems([]);
        }
    };

    /**
     * onSave will be called by your RecordModal for both create+update
     * Expected payload fields for Service:
     *  - id? (string) when editing
     *  - title (string)
     *  - description? (string)
     *  - features? (string[] OR comma string)
     *  - categoryId (string)
     *  - status? ("draft"|"published")
     *  - order? (number)
     *  - image?: File | string | null   (File -> upload, string -> direct URL, null -> clear, omit -> keep)
     */
    const onSave = async (payload: {
        id?: string;
        title: string;
        description?: string;
        features?: string[] | string;
        categoryId: string;
        status?: "draft" | "published";
        order?: number;
        image?: File | string | null; // support upload or URL or clear
    }): Promise<boolean> => {
        try {
            const { id, title, categoryId, status, order, image } = payload;
            const normalized: any = {
                title,
                description: payload.description ?? "",
                // allow comma string or array
                features: Array.isArray(payload.features)
                    ? payload.features
                    : typeof payload.features === "string"
                        ? payload.features.split(",").map((s) => s.trim()).filter(Boolean)
                        : [],
                category: String(categoryId),
                status: (status as any) || "published",
                order: Number(order) || 0,
            };

            if (id) {
                // UPDATE
                const body: any = { ...normalized };
                // image behavior:
                //   - File -> send as multipart
                //   - string -> send as JSON (server will keep as URL)
                //   - null -> clear existing
                //   - undefined -> keep as-is (omit)
                if (image && typeof image === "object" && (image as any) instanceof File) {
                    body.image = image; // multipart path in slice helper
                } else if (typeof image === "string") {
                    body.image = image;
                } else if (image === null) {
                    body.image = null;
                }
                await updateService({ id, data: body }).unwrap();
            } else {
                // CREATE
                const body: any = { ...normalized };
                if (image && typeof image === "object" && (image as any) instanceof File) {
                    body.image = image;
                } else if (typeof image === "string") {
                    body.image = image;
                } else {
                    // not provided or null -> server will set null
                    body.image = null;
                }
                await createService(body).unwrap();
            }

            setPageAlert({
                type: "success",
                message: id ? "Updated successfully." : "Created successfully.",
            });
            return true;
        } catch (e: any) {
            const apiMsg = e?.data?.message || e?.message || "Action failed";
            setPageAlert({ type: "error", message: apiMsg });
            return false;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
                        <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-[#B5040F] border-t-transparent"></div>
                    </div>
                    <p className="text-sm text-gray-600">Loading services...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        const errorMessage =
            (error as any)?.data?.message || (error as any)?.message || "An error occurred";
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 text-xs font-bold">!</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const namesPreview = (() => {
        const max = 5;
        const names = pendingDeleteItems.map((i) => i.title);
        const shown = names.slice(0, max);
        const extra = names.length - shown.length;
        return extra > 0 ? `${shown.join(", ")} +${extra} more` : shown.join(", ");
    })();

    return (
        <div className="space-y-4">
            {pageAlert && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-lg border p-3 text-sm flex items-start justify-between gap-3 ${pageAlert.type === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center ${pageAlert.type === "success" ? "bg-green-100" : "bg-red-100"
                                }`}
                        >
                            <span
                                className={`${pageAlert.type === "success" ? "text-green-700" : "text-red-700"
                                    } text-xs font-bold`}
                            >
                                !
                            </span>
                        </div>
                        <span>{pageAlert.message}</span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close alert"
                        onClick={() => setPageAlert(null)}
                        className="h-7 w-7 shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <DataTable
                rows={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
            // you can pass additional columns config if your table supports it
            />

            <RecordModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initial={editing ?? undefined}
                onSave={onSave}
            // optional: pass categories list to modal if it needs a dropdown
            />

            {/* Delete confirmation modal */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            {pendingDeleteItems.length === 1 ? (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                        {pendingDeleteItems[0]?.title}
                                    </span>
                                    ?
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                        {pendingDeleteItems.length}
                                    </span>{" "}
                                    services?
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {namesPreview}
                                    </div>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="min-w-[110px] relative"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="absolute left-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                                    Deleting...
                                </>
                            ) : (
                                "Yes, delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
