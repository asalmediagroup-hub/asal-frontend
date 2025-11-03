// app/(admin)/partners-reviews/modal.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    useGetPartnersReviewQuery,
    type PublishStatus,
    type PartnersReview,
} from "@/slices/partnersReviewApi";

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

type ImageMode = "keep" | "file" | "url" | "clear";
const BRAND = "#B5040F";
const STATUSES: PublishStatus[] = ["draft", "published"];

/** Table row model used by index.tsx */
export interface RecordItem {
    id: string;
    title: string;
    status: PublishStatus;
    itemsCount: number;
    author: string;
    date: string;
    coverImage?: string | null;
}

/** Item shape used in the modal form */
export type PRItem = {
    image?: File | string | null;
    title?: string;
    message: string;
    authorName: string;
    starsNo: number; // 1..5
};

interface PartnersReviewModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem & Partial<PartnersReview>;
    onSave: (payload: {
        id?: string;
        title: string;
        description?: string;
        status?: PublishStatus;
        items?: PRItem[];
    }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}

export default function PartnersReviewModal({
    open,
    onOpenChange,
    initial,
    onSave,
    onDelete,
}: PartnersReviewModalProps) {
    // ------------ form state ------------
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<PublishStatus>("draft");
    const [items, setItems] = useState<PRItem[]>([]);

    const [touched, setTouched] = useState({ title: false });

    // fetch full document when editing
    const docId = initial?.id || "";
    const { data: fullData } = useGetPartnersReviewQuery(docId, { skip: !docId });

    // seed state
    useEffect(() => {
        if (initial) {
            const src: any = fullData ?? initial;
            setTitle(src.title ?? "");
            setDescription(src.description ?? "");
            setStatus((src.status as PublishStatus) ?? "draft");

            // convert server items (image URL strings) into modal items
            const list: PRItem[] = Array.isArray(src.items)
                ? src.items.map((it: any) => ({
                    image: (it?.image as string) ?? null,
                    title: it?.title ?? "",
                    message: it?.message ?? "",
                    authorName: it?.authorName ?? "",
                    starsNo: clamp(Math.round(Number(it?.starsNo ?? 5)), 1, 5),
                }))
                : [];

            setItems(list);
        } else {
            setTitle("");
            setDescription("");
            setStatus("draft");
            setItems([]);
        }
        setTouched({ title: false });
    }, [initial, open, fullData]);

    const missing = useMemo(() => ({ title: !title.trim() }), [title]);
    const disabled = Object.values(missing).some(Boolean);

    // ------------ submit ------------
    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ title: true });
        if (disabled) return;

        setSubmitting(true);

        const payload = {
            id: initial?.id,
            title: title.trim(),
            description: description.trim(),
            status,
            items: (items ?? [])
                .map((it) => ({
                    image: normalizeImage(it.image),
                    title: String(it.title ?? "").trim(),
                    message: String(it.message ?? "").trim(),
                    authorName: String(it.authorName ?? "").trim(),
                    starsNo: clamp(Math.round(Number(it.starsNo ?? 5)), 1, 5),
                }))
                .filter((it) => it.message && it.authorName && it.starsNo >= 1),
        };

        const ok = await onSave(payload);
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    // ------------ UI ------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-3xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{initial ? "Edit partners review" : "Create partners review"}</DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Required fields are marked with <span className="font-semibold">*</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        {/* Core */}
                        <Section title="Core">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="title" className="text-[13px]">
                                        Title <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="title"
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

                                <div>
                                    <Label className="text-[13px]">Status</Label>
                                    <Select value={status} onValueChange={(v: PublishStatus) => setStatus(v)}>
                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="text-[13px]">Description</Label>
                                    <Textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-2 border border-neutral-300"
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Items */}
                        <Section title="Partner Reviews">
                            <Repeater<PRItem>
                                title="Items"
                                items={items}
                                setItems={setItems}
                                blankItem={{ image: null, title: "", message: "", authorName: "", starsNo: 5 }}
                            >
                                {(item, update, index, duplicate, remove) => (
                                    <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 md:col-span-6">
                                                <Field label="Title (optional)">
                                                    <Input
                                                        className="h-10 border border-neutral-300"
                                                        value={item.title ?? ""}
                                                        onChange={(e) => update({ title: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <ReviewItemImageField item={item} update={update} />
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <Field label="Author Name">
                                                    <Input
                                                        className="h-10 border border-neutral-300"
                                                        value={item.authorName}
                                                        onChange={(e) => update({ authorName: e.target.value })}
                                                        placeholder='e.g. "Hodan A."'
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <Field label="Stars (1–5)">
                                                    <Select
                                                        value={String(clamp(Number(item.starsNo || 5), 1, 5))}
                                                        onValueChange={(v) => update({ starsNo: clamp(Number(v), 1, 5) })}
                                                    >
                                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[1, 2, 3, 4, 5].map((n) => (
                                                                <SelectItem key={n} value={String(n)}>
                                                                    {n}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>

                                            <div className="col-span-12">
                                                <Field label="Message">
                                                    <Textarea
                                                        rows={3}
                                                        className="border border-neutral-300"
                                                        value={item.message}
                                                        onChange={(e) => update({ message: e.target.value })}
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="outline" onClick={duplicate}>
                                                Duplicate
                                            </Button>
                                            <Button type="button" variant="destructive" onClick={remove}>
                                                Remove
                                            </Button>
                                            <div className="ml-auto text-xs text-neutral-500">#{index + 1}</div>
                                        </div>
                                    </div>
                                )}
                            </Repeater>
                        </Section>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="sticky bottom-0 z-10 mt-auto gap-2 border-t bg-white px-4 py-3 sm:px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        {initial && onDelete && (
                            <Button type="button" variant="destructive" className="mr-auto" onClick={() => onDelete(initial.id)}>
                                Delete
                            </Button>
                        )}

                        <Button type="submit" disabled={disabled || submitting} className="bg-[#B5040F] hover:bg-[#a1040e]">
                            {submitting ? (initial ? "Updating..." : "Creating...") : initial ? "Save changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ---------------- helpers & subcomponents ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-7">
            <h3 className="mb-3 text-sm font-semibold text-neutral-700">{title}</h3>
            <div className="rounded-lg border border-neutral-200 p-4">{children}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="text-[13px]">{label}</Label>
            <div className="mt-2">{children}</div>
        </div>
    );
}

/** Image field for an individual review item (File | URL | Keep | Clear) */
function ReviewItemImageField({
    item,
    update,
}: {
    item: PRItem;
    update: (patch: Partial<PRItem>) => void;
}) {
    const controller = useImageController(typeof item.image === "string" ? item.image : null);

    useEffect(() => {
        const payload = controller.toPayload();
        if (payload === undefined) return; // keep mode, don't modify upstream
        if (payload === item.image) return;
        update({ image: payload });
    }, [controller.mode, controller.previewUrl, controller.urlInput, item.image, update]);

    return (
        <div className="space-y-2">
            <Label className="text-[13px]">Image</Label>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={controller.mode === "keep" ? "default" : "outline"}
                    onClick={controller.setKeep}
                    disabled={!controller.initialUrl}
                >
                    Keep current
                </Button>
                <Button type="button" variant={controller.mode === "file" ? "default" : "outline"} onClick={controller.setFile}>
                    Upload file
                </Button>
                <Button type="button" variant={controller.mode === "url" ? "default" : "outline"} onClick={controller.setUrl}>
                    Use URL
                </Button>
                <Button type="button" variant={controller.mode === "clear" ? "default" : "outline"} onClick={controller.setClear}>
                    Remove
                </Button>
            </div>

            {controller.mode === "keep" && controller.initialUrl && (
                <div className="rounded border p-3">
                    <div className="text-xs text-neutral-600 mb-2">Current image</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={controller.initialUrl || "/placeholder.svg"}
                        alt="Current"
                        className="h-32 w-full rounded object-cover"
                    />
                </div>
            )}

            {controller.mode === "file" && (
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => controller.onFile(e.target.files?.[0] || null)}
                        className="h-10"
                    />
                    {controller.previewUrl && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={controller.previewUrl || "/placeholder.svg"} alt="Preview" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {controller.mode === "url" && (
                <div className="space-y-2">
                    <Input
                        placeholder="https://example.com/image.jpg"
                        value={controller.urlInput && controller.urlInput.length > 200 ? "Image loaded (too long to display - click to edit)" : controller.urlInput}
                        onChange={(e) => controller.setUrlInput(e.target.value)}
                        className="h-10 border border-neutral-300"
                    />
                    {controller.urlInput.trim() && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={controller.urlInput || "/placeholder.svg"} alt="Preview" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {controller.mode === "clear" && <p className="text-xs text-neutral-500">Image will be removed.</p>}
        </div>
    );
}

type ImageController = ReturnType<typeof useImageController>;
function useImageController(initialUrl: string | null) {
    const [mode, setMode] = useState<ImageMode>(initialUrl ? "keep" : "file");
    const [file, setFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const blobRef = useRef<string | null>(null);
    const [seed, setSeed] = useState<{ initialUrl: string | null }>({ initialUrl });

    useEffect(() => {
        setMode(initialUrl ? "keep" : "file");
        setFile(null);
        setUrlInput("");
        setPreviewUrl(null);
        setSeed({ initialUrl: initialUrl });
    }, [initialUrl]);

    useEffect(() => {
        if (!file) {
            if (blobRef.current) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
            }
            setPreviewUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setPreviewUrl(u);
        blobRef.current = u;
        return () => {
            if (blobRef.current) URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        };
    }, [file]);

    return {
        mode,
        initialUrl: seed.initialUrl,
        previewUrl,
        urlInput,
        setUrlInput,
        setKeep: () => setMode("keep"),
        setFile: () => setMode("file"),
        setUrl: () => setMode("url"),
        setClear: () => {
            setMode("clear");
            setFile(null);
            setUrlInput("");
        },
        onFile: (f: File | null) => setFile(f),
        reset: (url: string | null) => {
            setMode(url ? "keep" : "file");
            setFile(null);
            setUrlInput("");
            setPreviewUrl(null);
            setSeed({ initialUrl: url });
        },
        toPayload(): File | string | null | undefined {
            if (mode === "keep") return undefined;
            if (mode === "file") return file ?? undefined;
            if (mode === "url") return urlInput.trim() || null;
            if (mode === "clear") return null;
            return undefined;
        },
    };
}

/* ---------- Generic Repeater ---------- */
function Repeater<T>({
    title,
    items,
    setItems,
    blankItem,
    children,
}: {
    title: string;
    items: T[];
    setItems: (next: T[]) => void;
    blankItem: T;
    children: (
        item: T,
        update: (patch: Partial<T>) => void,
        index: number,
        duplicate: () => void,
        remove: () => void
    ) => React.ReactNode;
}) {
    const add = () => setItems([...(items || []), structuredClone(blankItem)]);
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{title}</h4>
                <Button type="button" onClick={add} className="bg-[#B5040F] hover:bg-[#a1040e]">
                    Add
                </Button>
            </div>

            {(items ?? []).map((it, idx) => {
                const update = (patch: Partial<T>) => {
                    const next = [...items];
                    next[idx] = { ...(next[idx] as any), ...(patch as any) };
                    setItems(next);
                };
                const duplicate = () => {
                    const next = [...items];
                    next.splice(idx + 1, 0, structuredClone(it));
                    setItems(next);
                };
                const remove = () => {
                    const next = [...items];
                    next.splice(idx, 1);
                    setItems(next);
                };
                return <div key={idx}>{children(it, update, idx, duplicate, remove)}</div>;
            })}

            {(!items || items.length === 0) && (
                <div className="rounded-md border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500">
                    No items yet. Click <span className="font-medium">Add</span> to create one.
                </div>
            )}
        </div>
    );
}

/* ---------- utils ---------- */
function normalizeNullable(v: any): string | null {
    const s = String(v ?? "").trim();
    return s ? s : null;
}
function normalizeImage(v: File | string | null | undefined): File | string | null {
    if (v instanceof File) return v;
    if (typeof v === "string") return normalizeNullable(v);
    return null;
}
function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}
