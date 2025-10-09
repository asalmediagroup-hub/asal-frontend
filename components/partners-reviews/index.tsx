// app/(admin)/partners-reviews/index.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./table";          // same pattern as brands/services table
import RecordModal from "./modal";        // partners review modal (create/update form)
import {
    useGetPartnersReviewsQuery,
    useCreatePartnersReviewMutation,
    useUpdatePartnersReviewMutation,
    useDeletePartnersReviewMutation,
    type PartnersReview,
    type PublishStatus,
} from "@/slices/partnersReviewApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

/** Table row model for partners reviews */
export interface RecordItem {
    id: string;
    title: string;
    status: PublishStatus;     // "draft" | "published"
    itemsCount: number;        // items.length
    author: string;            // createdBy name/email
    date: string;              // createdAt (YYYY-MM-DD)
    // preview helpers
    coverImage?: string | null; // items[0].image if any
}

export default function ManagementPartnersReviews() {
    const { data, error, isLoading } = useGetPartnersReviewsQuery({ page: 1, limit: 100, sort: "createdAt" });
    const [createPR] = useCreatePartnersReviewMutation();
    const [updatePR] = useUpdatePartnersReviewMutation();
    const [deletePR] = useDeletePartnersReviewMutation();

    const [pageAlert, setPageAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);

    const items: RecordItem[] = useMemo(() => {
        const list = data?.data ?? [];
        return list.map((r: PartnersReview) => {
            const createdAt = r.createdAt ? String(r.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10);
            const author =
                (typeof r.createdBy === "object" && (r.createdBy?.name || r.createdBy?.email)) ||
                (typeof r.createdBy === "string" ? r.createdBy : "") ||
                "";
            const firstImg = Array.isArray(r.items) && r.items.length ? (r.items[0] as any)?.image ?? null : null;
            return {
                id: r._id,
                title: r.title,
                status: r.status,
                itemsCount: Array.isArray(r.items) ? r.items.length : 0,
                author,
                date: createdAt,
                coverImage: firstImg,
            };
        });
    }, [data]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<RecordItem | null>(null);

    // delete confirm modal
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
            await Promise.all(pendingDeleteItems.map((it) => deletePR(it.id).unwrap()));
            setPageAlert({
                type: "success",
                message:
                    pendingDeleteItems.length === 1
                        ? `Deleted "${pendingDeleteItems[0].title}" successfully.`
                        : `Deleted ${pendingDeleteItems.length} partners reviews successfully.`,
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
     * onSave from RecordModal (create + update)
     * Expected fields for PartnersReview (minimal):
     *  - id? string (when editing)
     *  - title: string
     *  - description?: string
     *  - status?: "draft" | "published"
     *  - items?: [{ title?, message, authorName, starsNo (1..5), image?: File|string|null }]
     */
    const onSave = async (payload: any): Promise<boolean> => {
        try {
            const { id, title, description, status, items } = payload;

            const clean: any = {
                title,
                description: description ?? "",
                status: status || "draft",
                items: Array.isArray(items) ? items : [],
            };

            if (id) {
                await updatePR({ id, data: clean }).unwrap();
            } else {
                await createPR(clean).unwrap();
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
                    <p className="text-sm text-gray-600">Loading partners reviews...</p>
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

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Partners Reviews</h2>

            </div>

            <DataTable
                rows={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
            // Extend columns in your local table to include itemsCount and preview if you want
            />

            <RecordModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initial={editing ?? undefined}
                onSave={onSave}
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
                                    <span className="font-semibold">{pendingDeleteItems[0]?.title}</span>?
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">{pendingDeleteItems.length}</span> partners reviews?
                                    <div className="mt-2 text-xs text-muted-foreground">{namesPreview}</div>
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
