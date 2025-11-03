"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecordItem } from ".";

// if you already have a categories API slice, swap this import:
import { useGetCategoriesQuery } from "@/slices/categoryApi"; // expects .data: { _id, name }[]

const BRAND = "#B5040F";
type ServiceStatus = "draft" | "published";

export default function RecordModal({
    open,
    onOpenChange,
    initial,
    onSave,
    onDelete, // optional when editing
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem; // from services index page
    onSave: (payload: {
        id?: string;
        title: string;
        description?: string;
        features?: string[] | string;
        categoryId: string;
        status?: ServiceStatus;
        order?: number;
        image?: File | string | null; // File -> upload, string -> direct URL, null -> clear, undefined -> keep
    }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}) {
    // ---- categories (for select) ----
    const { data: catResp } = useGetCategoriesQuery({ type: "service" }) ?? { data: undefined as any };
    const categories: { _id: string; name: string }[] = useMemo(() => {
        // support both {data: []} or [] directly
        const raw = Array.isArray(catResp) ? catResp : catResp?.data;
        return (raw ?? []).map((c: any) => ({ _id: String(c._id), name: String(c.name || c.title || c.slug || "") }));
    }, [catResp]);

    // ---- form state ----
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [status, setStatus] = useState<ServiceStatus>("published");
    const [order, setOrder] = useState<number>(0);

    const [description, setDescription] = useState("");
    const [featuresText, setFeaturesText] = useState(""); // comma-separated input

    // image handling: either from existing URL (initial.image), or choose File / URL / clear
    const [imageMode, setImageMode] = useState<"keep" | "file" | "url" | "clear">("keep");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

    const [touched, setTouched] = useState({
        title: false,
        category: false,
    });

    const imgPreviewUrl = usePreviewUrl(imageFile);

    useEffect(() => {
        if (initial) {
            setTitle(initial.title || "");
            setCategoryId(initial.categoryId || "");
            setStatus((initial.status as ServiceStatus) || "published");
            setOrder(typeof initial.order === "number" ? initial.order : 0);

            // description/features are not in RecordItem; keep empty (your modal can pass them back)
            setDescription(initial.description || "");
            setFeaturesText(initial.featuresPreview || ""); // seed with preview if you like

            // image: if there is one, default to "keep" else "clear"
            if (initial.image) {
                setImageMode("keep");
                setImageUrl(initial.image || "");
            } else {
                setImageMode("clear");
                setImageUrl("");
            }
            setImageFile(null);
        } else {
            setTitle("");
            setCategoryId("");
            setStatus("published");
            setOrder(0);
            setDescription("");
            setFeaturesText("");
            setImageMode("file"); // default to picking a file for new
            setImageFile(null);
            setImageUrl("");
        }
        setTouched({ title: false, category: false });
    }, [initial, open]);

    const missing = {
        title: !title.trim(),
        category: !categoryId.trim(),
    } as const;
    const disabled = Object.values(missing).some(Boolean);

    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ title: true, category: true });
        if (disabled) return;

        setSubmitting(true);

        // features normalization (string -> string[])
        const features =
            featuresText.trim().length > 0
                ? featuresText.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

        // image payload logic
        let imagePayload: File | string | null | undefined = undefined;
        switch (imageMode) {
            case "keep":
                imagePayload = undefined; // do not touch on server
                break;
            case "file":
                imagePayload = imageFile ?? undefined; // if no file chosen, keep as undefined (no touch)
                break;
            case "url":
                imagePayload = imageUrl.trim() || null; // empty -> clear
                break;
            case "clear":
                imagePayload = null; // explicit clear
                break;
        }

        const ok = await onSave({
            id: initial?.id,
            title: title.trim(),
            description: description.trim(),
            features,
            categoryId,
            status,
            order,
            image: imagePayload,
        });

        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    const statuses: ServiceStatus[] = ["draft", "published"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-2xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">
                            {initial ? "Edit service" : "Create service"}
                        </DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Fill the service details. Required fields are marked with{" "}
                            <span className="font-semibold">*</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        {/* Title */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="title" className="text-[13px]">
                                    Title <span className="text-red-600">*</span>
                                </Label>
                                <span className="text-xs text-neutral-500">{title.length}/120</span>
                            </div>
                            <Input
                                id="title"
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                                className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
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
                                <Label className="text-[13px]">
                                    Category <span className="text-red-600">*</span>
                                </Label>
                                <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                                    <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((c) => (
                                            <SelectItem key={c._id} value={c._id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {touched.category && missing.category && (
                                    <p className="mt-1 text-xs text-red-600">Please select a category.</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <Label className="text-[13px]">
                                    Status <span className="text-red-600">*</span>
                                </Label>
                                <Select value={status} onValueChange={(v: ServiceStatus) => setStatus(v)}>
                                    <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Order */}
                            <div>
                                <Label htmlFor="order" className="text-[13px]">
                                    Order
                                </Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={Number.isFinite(order) ? String(order) : "0"}
                                    onChange={(e) => setOrder(Number(e.target.value) || 0)}
                                    className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                    style={{ ["--brand" as any]: BRAND }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-5">
                            <Label htmlFor="description" className="text-[13px]">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-2 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                style={{ ["--brand" as any]: BRAND }}
                            />
                        </div>

                        {/* Features (comma separated) */}
                        <div className="mt-5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="features" className="text-[13px]">
                                    Features (comma separated)
                                </Label>
                                <span className="text-xs text-neutral-500">
                                    {featuresText ? featuresText.split(",").filter(Boolean).length : 0} items
                                </span>
                            </div>
                            <Input
                                id="features"
                                placeholder="e.g. Video Editing, Color Grading, Sound Design"
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                style={{ ["--brand" as any]: BRAND }}
                            />
                        </div>

                        {/* Image controls */}
                        <div className="mt-6 space-y-3">
                            <Label className="text-[13px]">Image</Label>

                            {/* mode selector */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={imageMode === "keep" ? "default" : "outline"}
                                    onClick={() => setImageMode("keep")}
                                    disabled={!initial?.image}
                                >
                                    Keep current
                                </Button>
                                <Button
                                    type="button"
                                    variant={imageMode === "file" ? "default" : "outline"}
                                    onClick={() => setImageMode("file")}
                                >
                                    Upload file
                                </Button>
                                <Button
                                    type="button"
                                    variant={imageMode === "url" ? "default" : "outline"}
                                    onClick={() => setImageMode("url")}
                                >
                                    Use URL
                                </Button>
                                <Button
                                    type="button"
                                    variant={imageMode === "clear" ? "default" : "outline"}
                                    onClick={() => {
                                        setImageMode("clear");
                                        setImageFile(null);
                                        setImageUrl("");
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>

                            {/* mode views */}
                            {imageMode === "keep" && initial?.image && (
                                <div className="rounded border p-3">
                                    <div className="text-xs text-neutral-600 mb-2">Current image</div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={initial.image}
                                        alt="Current service image"
                                        className="h-32 w-full rounded object-cover"
                                    />
                                </div>
                            )}

                            {imageMode === "file" && (
                                <div className="space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setImageFile(f);
                                        }}
                                        className="h-10"
                                    />
                                    {(imgPreviewUrl || initial?.image) && (
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imgPreviewUrl || initial?.image || ""}
                                                alt="Preview"
                                                className="h-32 w-full rounded object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {imageMode === "url" && (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="https://example.com/image.jpg"
                                        value={imageUrl && imageUrl.length > 200 ? "Image loaded (too long to display - click to edit)" : imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="h-10"
                                    />
                                    {imageUrl.trim() && (
                                        <div className="rounded border p-3">
                                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="h-32 w-full rounded object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {imageMode === "clear" && (
                                <p className="text-xs text-neutral-500">Image will be removed.</p>
                            )}
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

/** local hook: preview an image File */
function usePreviewUrl(file: File | null) {
    const [url, setUrl] = useState<string | null>(null);
    const ref = useRef<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            if (ref.current) {
                URL.revokeObjectURL(ref.current);
                ref.current = null;
            }
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        ref.current = u;
        return () => {
            if (ref.current) URL.revokeObjectURL(ref.current);
            ref.current = null;
        };
    }, [file]);

    return url;
}
