// app/(admin)/packages/index.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./table";          // same table interface as other admin lists
import RecordModal from "./modal";        // package modal (create/update form)
import {
    useGetPackagesQuery,
    useCreatePackageMutation,
    useUpdatePackageMutation,
    useDeletePackageMutation,
    type PackageDoc,
    type PublishStatus,
    type PackageSlug,
    type PackageCategory,
} from "@/slices/packageApi";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/** Table row model for packages */
export interface RecordItem {
    id: string;
    title: string;
    description: string;
    slug: PackageSlug;                  // 'religious' | 'social' | 'news' | 'sports'
    status: PublishStatus;              // 'draft' | 'published'
    category: PackageCategory;
    author: string;                     // createdBy display (name/email/id)
    date: string;                       // createdAt (YYYY-MM-DD)
    // preview helpers
    previewImage?: string | null;       // first featured story image if any
    storiesCount?: number;              // number of featured stories
}

export default function ManagementPackages() {
    const { data, error, isLoading } = useGetPackagesQuery({ page: 1, limit: 100, sort: "createdAt" });
    const [createPackage] = useCreatePackageMutation();
    const [updatePackage] = useUpdatePackageMutation();
    const [deletePackage] = useDeletePackageMutation();

    const [pageAlert, setPageAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);

    const items: RecordItem[] = useMemo(() => {
        const list = data?.data ?? [];
        return list.map((p: PackageDoc) => {
            const createdAt = p.createdAt ? String(p.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10);
            const author =
                (typeof p.createdBy === "object" && (p.createdBy?.name || p.createdBy?.email)) ||
                (typeof p.createdBy === "string" ? p.createdBy : "") ||
                "";
            const firstImg = p.featuredStories?.[0]?.image ?? null;
            return {
                id: p._id,
                title: p.title,
                description: p.description,
                slug: p.slug,
                status: p.status,
                category: p.category,
                author,
                date: createdAt,
                previewImage: firstImg ?? null,
                storiesCount: p.featuredStories?.length ?? 0,
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
            await Promise.all(pendingDeleteItems.map((it) => deletePackage(it.id).unwrap()));
            setPageAlert({
                type: "success",
                message:
                    pendingDeleteItems.length === 1
                        ? `Deleted "${pendingDeleteItems[0].title}" successfully.`
                        : `Deleted ${pendingDeleteItems.length} packages successfully.`,
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
     * Expected minimal payload for Package:
     *  - id? string (when editing)
     *  - title (string, required)
     *  - description (string, required)
     *  - slug: 'religious' | 'social' | 'news' | 'sports'  (unique: only one doc per slug)
     *  - status?: 'draft' | 'published'
     *  - category: PackageCategory (see union type)
     *  - featuredStories?: [{
     *      image?: File | string | null,
     *      title: string,
     *      description: string,
     *      author: string,
     *      date: string,
     *      fullVersion: string
     *    }]
     */
    const onSave = async (payload: any): Promise<boolean> => {
        try {
            const {
                id,
                title,
                description,
                slug,
                status,
                category,
                featuredStories,
            } = payload;

            const clean: any = {
                title,
                description,
                slug,
                status: status || "draft",
                category,
                featuredStories: featuredStories ?? [],
            };

            if (id) {
                await updatePackage({ id, data: clean }).unwrap();
            } else {
                await createPackage(clean).unwrap();
            }

            setPageAlert({
                type: "success",
                message: id ? "Updated successfully." : "Created successfully.",
            });
            return true;
        } catch (e: any) {
            // Backend enforces one document per slug; expect 409 conflict with a friendly message.
            const apiMsg =
                e?.data?.message ||
                (e?.status === 409 ? "A package with this slug already exists." : e?.message) ||
                "Action failed";
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
                    <p className="text-sm text-gray-600">Loading packages...</p>
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
                <h1 className="text-lg font-semibold">Packages</h1>
                {/* <Button onClick={onCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Package
                </Button> */}
            </div>

            <DataTable
                rows={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
            // If your table supports custom columns, you can extend to show slug, status, category, storiesCount, previewImage, etc.
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
                                    packages?
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
