// ===============================
// app/categories/modal.tsx
// ===============================
"use client";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type CategoryRow } from "./table";


const BRAND = "#B5040F";


const TYPES = ["service"] as const; // extend freely


type CategoryType = (typeof TYPES)[number];


export default function RecordModal({
    open,
    onOpenChange,
    initial,
    onSave,
    onDelete,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: CategoryRow;
    onSave: (payload: Omit<CategoryRow, "id"> & { id?: string; name?: string }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<CategoryType>("service");
    const [date, setDate] = useState("");


    const [touched, setTouched] = useState({ name: false, type: false });


    useEffect(() => {
        if (initial) {
            setName(initial.title);
            setType((initial.type as CategoryType) || "service");
            setDate(initial.date);
        } else {
            setName("");
            setType("service");
            setDate(new Date().toISOString().slice(0, 10));
        }
        setTouched({ name: false, type: false });
    }, [initial, open]);


    const missing = { name: !name.trim(), type: !type } as const;
    const disabled = Object.values(missing).some(Boolean);


    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ name: true, type: true });
        if (disabled) return;
        setSubmitting(true);
        const ok = await onSave({ id: initial?.id, title: name.trim(), name: name.trim(), type, date });
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initial ? "Edit Category" : "Create Category"}</DialogTitle>
                    <DialogDescription>
                        {initial ? "Update the category details below." : "Add a new category to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter category name"
                            className={touched.name && missing.name ? "border-red-500" : ""}
                        />
                        {touched.name && missing.name && (
                            <p className="text-sm text-red-500">Name is required</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as CategoryType)}>
                            <SelectTrigger className={touched.type && missing.type ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {touched.type && missing.type && (
                            <p className="text-sm text-red-500">Type is required</p>
                        )}
                    </div>
                    <DialogFooter>
                        {initial && onDelete && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    onDelete(initial.id);
                                    onOpenChange(false);
                                }}
                            >
                                Delete
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={disabled || submitting}
                            style={{ backgroundColor: BRAND }}
                        >
                            {submitting ? "Saving..." : initial ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}