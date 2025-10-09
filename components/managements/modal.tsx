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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RecordItem } from ".";

type RecordStatus = "Published" | "Draft" | "Scheduled";
const BRAND = "#B5040F";

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
    onSave: (payload: Omit<RecordItem, "id"> & { id?: string }) => void;
    onDelete?: (id: string) => void;
}) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState<RecordStatus>("Draft");
    const [author, setAuthor] = useState("");
    const [date, setDate] = useState("");
    const [views, setViews] = useState<number | "">("");
    const [note, setNote] = useState("");

    const [touched, setTouched] = useState({
        title: false,
        category: false,
        author: false,
        date: false,
    });

    useEffect(() => {
        if (initial) {
            setTitle(initial.title);
            setCategory(initial.category);
            setStatus(initial.status as RecordStatus);
            setAuthor(initial.author);
            setDate(initial.date);
            setViews(initial.views);
            setNote("");
        } else {
            setTitle("");
            setCategory("");
            setStatus("Draft");
            setAuthor("");
            setDate(new Date().toISOString().slice(0, 10));
            setViews(0);
            setNote("");
        }
        setTouched({ title: false, category: false, author: false, date: false });
    }, [initial, open]);

    const missing = {
        title: !title.trim(),
        category: !category.trim(),
        author: !author.trim(),
        date: !date,
    };
    const disabled = Object.values(missing).some(Boolean);

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ title: true, category: true, author: true, date: true });
        if (disabled) return;
        onSave({
            id: initial?.id,
            title: title.trim(),
            category: category.trim(),
            status,
            author: author.trim(),
            date,
            views: typeof views === "number" ? views : 0,
        });
    };

    const statuses: RecordStatus[] = ["Draft", "Published", "Scheduled"];

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
                        {/* Title full width */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="title" className="text-[13px]">
                                    Title <span className="text-red-600">*</span>
                                </Label>
                                <span className="text-xs text-neutral-500">
                                    {title.length}/120
                                </span>
                            </div>
                            <Input
                                id="title"
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                                className="mt-2 h-10 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                style={{ ["--brand" as any]: BRAND }}
                            />
                            {touched.title && missing.title && (
                                <p className="mt-1 text-xs text-red-600">Please enter a title.</p>
                            )}
                        </div>

                        {/* Two columns */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Category */}
                            <div>
                                <Label htmlFor="category" className="text-[13px]">
                                    Category <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, category: true }))}
                                    className="mt-2 h-10 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                                {touched.category && missing.category && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Please enter a category.
                                    </p>
                                )}
                            </div>

                            {/* Author */}
                            <div>
                                <Label htmlFor="author" className="text-[13px]">
                                    Author <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, author: true }))}
                                    className="mt-2 h-10 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                                {touched.author && missing.author && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Please enter an author.
                                    </p>
                                )}
                            </div>

                            {/* Status (segmented pills) */}
                            <div>
                                <Label className="text-[13px]">
                                    Status <span className="text-red-600">*</span>
                                </Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {statuses.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            aria-pressed={s === status}
                                            className={[
                                                "h-9 rounded-full border px-3 text-sm transition",
                                                s === status
                                                    ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                                                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
                                            ].join(" ")}
                                            style={{ ["--brand" as any]: BRAND }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <Label htmlFor="date" className="text-[13px]">
                                    Date <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                                    className="mt-2 h-10 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                                {touched.date && missing.date && (
                                    <p className="mt-1 text-xs text-red-600">Please pick a date.</p>
                                )}
                            </div>

                            {/* Views */}
                            <div>
                                <Label htmlFor="views" className="text-[13px]">
                                    Views
                                </Label>
                                <Input
                                    id="views"
                                    inputMode="numeric"
                                    type="number"
                                    min={0}
                                    value={views}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setViews(v === "" ? "" : Number(v));
                                    }}
                                    className="mt-2 h-10 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                            </div>
                        </div>

                        {/* Notes full width */}
                        <div className="mt-5">
                            <Label htmlFor="note" className="text-[13px]">
                                Notes
                            </Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Internal note (optional)"
                                className="mt-2 min-h-[100px] resize-y focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                style={{ ["--brand" as any]: BRAND }}
                            />
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
                            disabled={disabled}
                            className="bg-[#B5040F] hover:bg-[#a1040e]"
                        >
                            {initial ? "Save changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
