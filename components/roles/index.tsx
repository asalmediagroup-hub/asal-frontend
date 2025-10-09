"use client";

import { useMemo, useState, useEffect } from "react";
import RoleCard from "./roleCard";
import AddNewCard from "./addNewCard";
import RoleModal from "./modal";
import {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    Role,
    Permission,
} from "@/slices/roleApi";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

export default function RolesPage() {
    const { data, isLoading, error } = useGetRolesQuery();
    const [createRole] = useCreateRoleMutation();
    const [updateRole] = useUpdateRoleMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const roles: Role[] = useMemo(() => data?.data ?? [], [data]);

    // modal state
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);

    const handleAdd = () => {
        setEditing(null);
        setOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditing(role);
        setOpen(true);
    };

    // --- Alert (3s, closable) ---
    const [pageAlert, setPageAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    useEffect(() => {
        if (!pageAlert) return;
        const id = window.setTimeout(() => setPageAlert(null), 3000);
        return () => window.clearTimeout(id);
    }, [pageAlert]);

    // --- Delete confirmation ---
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const askDelete = (role: Role) => {
        setPendingDelete(role);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            setIsDeleting(true);
            await deleteRole(pendingDelete._id).unwrap();
            setPageAlert({ type: "success", message: `Deleted "${pendingDelete.name}" successfully.` });
        } catch (e: any) {
            const apiMsg = e?.data?.message || e?.message || "Delete failed";
            setPageAlert({ type: "error", message: apiMsg });
        } finally {
            setIsDeleting(false);
            setDeleteOpen(false);
            setPendingDelete(null);
        }
    };

    const onSubmit = async (payload: { id?: string; name: string; description?: string; permissions: Permission[] }) => {
        try {
            if (payload.id) {
                await updateRole({
                    id: payload.id,
                    data: { name: payload.name, description: payload.description, permissions: payload.permissions },
                }).unwrap();
                setPageAlert({ type: "success", message: "Updated successfully." });
            } else {
                await createRole({
                    name: payload.name,
                    description: payload.description,
                    permissions: payload.permissions,
                }).unwrap();
                setPageAlert({ type: "success", message: "Created successfully." });
            }
            return true;
        } catch (e: any) {
            const msg = e?.data?.message || e?.message || "Action failed";
            setPageAlert({ type: "error", message: msg });
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
                        <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-[#B5040F] border-t-transparent"></div>
                    </div>
                    <p className="text-sm text-gray-600">Loading roles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        const message = (error as any)?.data?.message || (error as any)?.message || "An error occurred";
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page alert */}
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

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Add new */}
                <AddNewCard onClick={handleAdd} />

                {/* Existing roles */}
                {roles.map((r) => (
                    <RoleCard
                        key={r._id}
                        title={r.name}
                        description={r.description}
                        onEdit={() => handleEdit(r)}
                        onDelete={() => askDelete(r)}
                    />
                ))}
            </div>

            {/* Create / Edit Modal */}
            <RoleModal
                open={open}
                onOpenChange={setOpen}
                initial={
                    editing
                        ? {
                            id: editing._id,
                            name: editing.name,
                            description: editing.description,
                            permissions: editing.permissions ?? [],
                        }
                        : undefined
                }
                onSubmit={onSubmit}
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
                            {pendingDelete ? (
                                <>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">{pendingDelete.name}</span>?
                                </>
                            ) : (
                                "Are you sure you want to delete this role?"
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
