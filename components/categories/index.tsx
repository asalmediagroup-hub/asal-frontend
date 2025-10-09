// ===============================
// app/categories/Management.tsx
// ===============================
"use client";


import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DataTable, { type CategoryRow } from "./table";
import RecordModal from "./modal";
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "@/slices/categoryApi";


export default function CategoriesManagement() {
    const { data, error, isLoading } = useGetCategoriesQuery(undefined);
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();


    const [pageAlert, setPageAlert] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);


    // Auto-dismiss alert
    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);


    const items: CategoryRow[] = useMemo(() => {
        const categories = data?.data ?? [];
        return categories.map((c: any) => ({
            id: c._id,
            title: c.name,
            type: c.type || "service",
            createdBy: typeof c.createdBy === "object" ? c.createdBy?.name ?? "" : "",
            date: c.createdAt ? String(c.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
        }));
    }, [data]);


    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CategoryRow | null>(null);


    // Delete confirm modal
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteItems, setPendingDeleteItems] = useState<CategoryRow[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);


    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };


    const onEdit = (item: CategoryRow) => {
        setEditing(item);
        setModalOpen(true);
    };


    const onDelete = async (ids: string[]) => {
        const selected = items.filter((it) => ids.includes(it.id));
        if (!selected.length) return;
        setPendingDeleteItems(selected);
        setDeleteOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Page Alert */}
            {pageAlert && (
                <div className={`rounded-md p-4 ${pageAlert.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{pageAlert.message}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setPageAlert(null)}
                                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <DataTable
                rows={items}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
            />

            {/* Create/Edit Modal */}
            <RecordModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initial={editing || undefined}
                onSave={async (data) => {
                    try {
                        if (editing) {
                            await updateCategory({ id: editing.id, data }).unwrap();
                            setPageAlert({ type: "success", message: "Category updated successfully" });
                        } else {
                            await createCategory({ name: data.name || data.title, type: data.type }).unwrap();
                            setPageAlert({ type: "success", message: "Category created successfully" });
                        }
                        setModalOpen(false);
                        return true;
                    } catch (error: any) {
                        setPageAlert({
                            type: "error",
                            message: error?.data?.message || "An error occurred"
                        });
                        return false;
                    }
                }}
            />

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Categories</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {pendingDeleteItems.length} category(ies)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    await Promise.all(
                                        pendingDeleteItems.map(item =>
                                            deleteCategory(item.id).unwrap()
                                        )
                                    );
                                    setPageAlert({ type: "success", message: "Categories deleted successfully" });
                                    setDeleteOpen(false);
                                } catch (error: any) {
                                    setPageAlert({
                                        type: "error",
                                        message: error?.data?.message || "An error occurred"
                                    });
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}