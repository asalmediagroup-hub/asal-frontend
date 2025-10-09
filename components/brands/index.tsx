// app/(admin)/brands/index.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable from "./table";         // same table component pattern as services
import RecordModal from "./modal";       // brand modal (create/update form)
import {
    useGetBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation,
    type Brand,
    type PublishStatus,
} from "@/slices/brandApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

/** Table row model for brands */
export interface RecordItem {
    id: string;
    title: string;                 // brand.name
    slug: string;                  // brand.slug
    status: PublishStatus;         // "draft" | "published"
    order: number;                 // sort order
    heroTitle?: string;            // preview
    author: string;                // createdBy name/email (display)
    date: string;                  // createdAt (YYYY-MM-DD)
    // previews only
    heroBgImage?: string | null;
    aboutImage?: string | null;
}

export default function ManagementBrands() {
    const { data, error, isLoading } = useGetBrandsQuery({ page: 1, limit: 100, sort: "order" });
    const [createBrand] = useCreateBrandMutation();
    const [updateBrand] = useUpdateBrandMutation();
    const [deleteBrand] = useDeleteBrandMutation();

    const [pageAlert, setPageAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);

    const items: RecordItem[] = useMemo(() => {
        const list = data?.data ?? [];
        return list.map((b: Brand) => {
            const createdAt = b.createdAt ? String(b.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10);
            const author =
                (typeof b.createdBy === "object" && (b.createdBy?.name || b.createdBy?.email)) ||
                (typeof b.createdBy === "string" ? b.createdBy : "") ||
                "";
            return {
                id: b._id,
                title: b.name,
                slug: b.slug,
                status: b.status,
                order: b.order ?? 0,
                heroTitle: b.heroTitle || "",
                author,
                date: createdAt,
                heroBgImage: b.heroBgImage ?? null,
                aboutImage: b.aboutImage ?? null,
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
            await Promise.all(pendingDeleteItems.map((it) => deleteBrand(it.id).unwrap()));
            setPageAlert({
                type: "success",
                message:
                    pendingDeleteItems.length === 1
                        ? `Deleted "${pendingDeleteItems[0].title}" successfully.`
                        : `Deleted ${pendingDeleteItems.length} brands successfully.`,
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
     * Expected fields for Brand (minimal):
     *  - id? string (when editing)
     *  - name: string
     *  - slug: "asal-tv" | "jiil-media" | "masrax-production" | "nasiye"
     *  - status?: "draft" | "published"
     *  - order?: number
     *  - heroTitle?, heroDescription?
     *  - heroBgImage?: File | string | null
     *  - heroBgImageMobile?: File | string | null
     *  - aboutTitle?, aboutDescription?
     *  - aboutImage?: File | string | null
     *  - featuredDescription?, featuredItems? (array with URLs for images)
     *  - platformFeaturesDescription?, platformFeatures?
     *  - contentCategoriesDescription?, contentCategories?
     *  - screenshotTitle?, screenshotImage?: File | string | null
     *  - reviewsTitle?, userReviews?
     */
    const onSave = async (payload: any): Promise<boolean> => {
        try {
            const {
                id,
                name,
                slug,
                status,
                order,
                heroTitle,
                heroDescription,
                heroBgImage,
                heroBgImageMobile,
                aboutTitle,
                aboutDescription,
                aboutImage,
                featuredDescription,
                featuredItems,
                platformFeaturesDescription,
                platformFeatures,
                contentCategoriesDescription,
                contentCategories,
                screenshotTitle,
                screenshotImage,
                reviewsTitle,
                userReviews,
            } = payload;

            const clean: any = {
                name,
                slug,
                status: status || "draft",
                order: Number(order) || 0,
                heroTitle: heroTitle ?? "",
                heroDescription: heroDescription ?? "",
                aboutTitle: aboutTitle ?? "",
                aboutDescription: aboutDescription ?? "",
                featuredDescription: featuredDescription ?? "",
                featuredItems: featuredItems ?? [],
                platformFeaturesDescription: platformFeaturesDescription ?? "",
                platformFeatures: platformFeatures ?? [],
                contentCategoriesDescription: contentCategoriesDescription ?? "",
                contentCategories: contentCategories ?? [],
                screenshotTitle: screenshotTitle ?? "",
                reviewsTitle: reviewsTitle ?? "",
                userReviews: userReviews ?? [],
            };

            // Images (File | string | null | undefined). Omit to keep; null to clear; string URL to set.
            if (heroBgImage !== undefined) clean.heroBgImage = heroBgImage;
            if (heroBgImageMobile !== undefined) clean.heroBgImageMobile = heroBgImageMobile;
            if (aboutImage !== undefined) clean.aboutImage = aboutImage;
            if (screenshotImage !== undefined) clean.screenshotImage = screenshotImage;

            if (id) {
                await updateBrand({ id, data: clean }).unwrap();
            } else {
                await createBrand(clean).unwrap();
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
                    <p className="text-sm text-gray-600">Loading brands...</p>
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
            // If your table supports extra columns, you can extend it similarly to services
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
                                    <span className="font-semibold">{pendingDeleteItems.length}</span> brands?
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
