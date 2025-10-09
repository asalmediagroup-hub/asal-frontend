"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useGetRolesQuery } from "@/slices/roleApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RecordItem } from ".";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RecordStatus = "active" | "suspended" | "inactive";
const BRAND = "#B5040F";

// Temporary roles list (id + name). Submit id, display name
const ROLES: { _id: string; name: string }[] = [
    { _id: "68bece7adab166f6e430ffae", name: "Admin" },
    { _id: "68bedd9e8a4372e52f37b18d", name: "Role Manager" },
    { _id: "68bedd638a4372e52f37b188", name: "Role Creator and Updator" },
    { _id: "68beddbd8a4372e52f37b192", name: "User Deletor" },
];

export default function RecordModal({
    open,
    onOpenChange,
    initial,
    onSave,
    onDelete, // optional when editing
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem;
    onSave: (payload: Omit<RecordItem, "id"> & { id?: string; roleId?: string; password?: string; name?: string }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [roleId, setRoleId] = useState<string>("");
    const [status, setStatus] = useState<RecordStatus>("active");
    const [author, setAuthor] = useState("");
    const [password, setPassword] = useState("");
    const [date, setDate] = useState("");
    const { data: roles } = useGetRolesQuery();
    const rolesList = roles?.data?.map((role) => ({ _id: role._id, name: role.name }));

    const [touched, setTouched] = useState({
        name: false,
        role: false,
        author: false,
        date: false,
    });

    useEffect(() => {
        if (initial) {
            setName(initial.title);
            setRoleId(initial.roleId || "");
            setStatus((initial.status as RecordStatus) || "active");
            setAuthor(initial.author);
            setDate(initial.date);
            setPassword("");
        } else {
            setName("");
            setRoleId("");
            setStatus("active");
            setAuthor("");
            setDate(new Date().toISOString().slice(0, 10));
            setPassword("");
        }
        setTouched({ name: false, role: false, author: false, date: false });
    }, [initial, open]);

    const missing = {
        name: !name.trim(),
        role: !roleId.trim(),
        author: !author.trim(),
        // password required only on create
        password: !initial && !password.trim(),
        date: !date,
    } as const;
    const disabled = Object.values(missing).some(Boolean);

    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ name: true, role: true, author: true, date: true });
        if (disabled) return;
        setSubmitting(true);
        const ok = await onSave({
            id: initial?.id,
            title: name.trim(),
            name: name.trim(),
            role: (rolesList?.find(r => r._id === roleId)?.name ?? ""),
            status,
            author: author.trim(),
            date,
            roleId,
            password: password || undefined
        });
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };
    const statuses: RecordStatus[] = ["active", "suspended", "inactive"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 sm:max-w-2xl overflow-hidden"
            // soft rounded + strong shadow
            >
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">
                            {initial ? "Edit record" : "Create record"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Add structured details. Required fields are marked with{" "}
                            <span className="font-semibold">*</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        {/* Name full width */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="name" className="text-[13px]">
                                    Name <span className="text-red-600">*</span>
                                </Label>
                                <span className="text-xs text-neutral-500">
                                    {name.length}/120
                                </span>
                            </div>
                            <Input
                                id="name"
                                maxLength={120}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                style={{ ["--brand" as any]: BRAND }}
                            />
                            {touched.name && missing.name && (
                                <p className="mt-1 text-xs text-red-600">Please enter a name.</p>
                            )}
                        </div>

                        {/* Two columns */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Email */}
                            <div>
                                <Label htmlFor="author" className="text-[13px]">
                                    Email <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="author"
                                    type="email"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, author: true }))}
                                    className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                                {touched.author && missing.author && (
                                    <p className="mt-1 text-xs text-red-600">Please enter a valid email.</p>
                                )}
                            </div>

                            {/* Password (only for create) */}
                            {!initial && (
                                <div>
                                    <Label htmlFor="password" className="text-[13px]">
                                        Password <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                        style={{ ["--brand" as any]: BRAND }}
                                    />
                                    {missing.password && (
                                        <p className="mt-1 text-xs text-red-600">Please enter a password.</p>
                                    )}
                                </div>
                            )}

                            {/* Role select */}
                            <div>
                                <Label className="text-[13px]">
                                    Role <span className="text-red-600">*</span>
                                </Label>
                                <Select value={roleId} onValueChange={(v) => setRoleId(v)}>
                                    <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rolesList?.map((r) => (
                                            <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {touched.role && missing.role && (
                                    <p className="mt-1 text-xs text-red-600">Please select a role.</p>
                                )}
                            </div>

                            {/* Status (segmented pills) */}
                            <div>
                                <Label className="text-[13px]">
                                    Status <span className="text-red-600">*</span>
                                </Label>
                                <Select value={status} onValueChange={(v: RecordStatus) => setStatus(v)}>
                                    <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <DialogFooter className="sticky bottom-0 z-10 mt-auto gap-2 border-t bg-white px-4 py-3 sm:px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        {initial && onDelete && (
                            <Button
                                type="button"
                                variant="destructive"
                                className="mr-auto"
                                onClick={() => onDelete(initial.id)}
                            >
                                Delete
                            </Button>
                        )}

                        <Button
                            type="submit"
                            disabled={disabled || submitting}
                            className="bg-[#B5040F] hover:bg-[#a1040e]"
                        >
                            {submitting ? (initial ? "Updating..." : "Creating...") : (initial ? "Save changes" : "Create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
