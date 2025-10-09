// app/(admin)/portfolio/modal.tsx
"use client";

import type React from "react";
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

import type { PortfolioDoc } from "@/slices/portfolioApi";
import { useGetPortfolioByIdQuery } from "@/slices/portfolioApi";

type ImageMode = "keep" | "file" | "url" | "clear";

export type PortfolioCategory =
    | "Documentary"
    | "Digital Content"
    | "Commercial"
    | "Streaming Content"
    | "Life Event"
    | "Web Series";

const CATEGORIES: PortfolioCategory[] = [
    "Documentary",
    "Digital Content",
    "Commercial",
    "Streaming Content",
    "Life Event",
    "Web Series",
];

export interface PortfolioItemForm {
    image?: File | string | null; // optional
    title: string;                 // required
    description: string;           // required
    date: string;                  // required (YYYY-MM-DD)
    category: PortfolioCategory;   // required
    video?: string;                // optional URL
    text?: string;                 // optional long text
}

/** Matches RecordItem from portfolio/index plus extra fields when editing */
interface RecordItem {
    id: string;
    title: string;
    date: string;
    description?: string;
    itemsCount?: number;
    firstItemTitle?: string;
    firstItemImage?: string | null;
}

interface PortfolioModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem &
    Partial<{
        description: string;
        items: PortfolioItemForm[];
    }>;
    onSave: (payload: {
        id?: string;
        title: string;
        description?: string;
        items?: PortfolioItemForm[];
    }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}

export default function PortfolioModal({
    open,
    onOpenChange,
    initial,
    onSave,
    onDelete,
}: PortfolioModalProps) {
    // ---------------- form state ----------------
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [items, setItems] = useState<PortfolioItemForm[]>([]);
    const [touched, setTouched] = useState({ title: false });

    // fetch full portfolio when editing to seed all fields
    const portfolioId = initial?.id || "";
    const { data: portfolioData } = useGetPortfolioByIdQuery(portfolioId, { skip: !portfolioId });

    // seed from initial / portfolioData
    useEffect(() => {
        if (initial) {
            const src = (portfolioData as PortfolioDoc | undefined) ?? (initial as any);

            setTitle(src.title ?? "");
            setDescription(src.description ?? "");

            const serverItems =
                (src as any).items as
                | {
                    image?: string | null;
                    title: string;
                    description: string;
                    date: string;
                    category: PortfolioCategory;
                    video?: string;
                    text?: string;
                }[]
                | undefined;

            setItems(
                Array.isArray(serverItems)
                    ? serverItems.map((it) => ({
                        image: it?.image ?? null,
                        title: it?.title ?? "",
                        description: it?.description ?? "",
                        date: normalizeDateForInput(it?.date) || new Date().toISOString().slice(0, 10),
                        category: (it?.category as PortfolioCategory) || "Digital Content",
                        video: it?.video ?? "",
                        text: it?.text ?? "",
                    }))
                    : []
            );
        } else {
            setTitle("");
            setDescription("");
            setItems([]);
        }
        setTouched({ title: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, open, portfolioData]);

    const missing = useMemo(() => ({ title: !title.trim() }), [title]);
    const disabled = Object.values(missing).some(Boolean);

    // ---------------- submit ----------------
    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ title: true });
        if (disabled) return;

        setSubmitting(true);

        const payload = {
            id: initial?.id,
            title: title.trim(),
            description: description.trim(),
            items: (items ?? [])
                .map((it) => ({
                    image: normalizeImage(it?.image), // File | string | null
                    title: String(it?.title ?? "").trim(),
                    description: String(it?.description ?? "").trim(),
                    date: it?.date ? it.date : "",
                    category: (it?.category || "Digital Content") as PortfolioCategory,
                    video: String(it?.video ?? "").trim(),
                    text: String(it?.text ?? "").trim(),
                }))
                // keep rows unless completely empty
                .filter((it) => !isCompletelyEmptyItem(it)),
        };

        const ok = await onSave(payload);
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    // ---------------- UI ----------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-3xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{initial ? "Edit portfolio" : "Create portfolio"}</DialogTitle>
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
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                    {touched.title && missing.title && (
                                        <p className="mt-1 text-xs text-red-600">Please enter a title.</p>
                                    )}
                                </div>

                                <div className="md:col-span-1">
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
                        <Section title="Portfolio Items">
                            <Repeater<PortfolioItemForm>
                                title="Items"
                                items={items}
                                setItems={setItems}
                                blankItem={{
                                    image: null,
                                    title: "",
                                    description: "",
                                    date: new Date().toISOString().slice(0, 10),
                                    category: "Digital Content",
                                    video: "",
                                    text: "",
                                }}
                            >
                                {(item, update, index, duplicate, remove) => (
                                    <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 md:col-span-4">
                                                <Field label="Title">
                                                    <Input
                                                        className="h-10 border border-neutral-300"
                                                        value={item.title}
                                                        onChange={(e) => update({ title: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-4">
                                                <Field label="Date">
                                                    <Input
                                                        type="date"
                                                        className="h-10 border border-neutral-300"
                                                        value={item.date || ""}
                                                        onChange={(e) => update({ date: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-4">
                                                <Field label="Category">
                                                    <Select
                                                        value={item.category}
                                                        onValueChange={(v: PortfolioCategory) => update({ category: v })}
                                                    >
                                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CATEGORIES.map((c) => (
                                                                <SelectItem key={c} value={c}>
                                                                    {c}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <ItemImageField item={item} update={update} />
                                            </div>

                                            <div className="col-span-12">
                                                <Field label="Description">
                                                    <Textarea
                                                        rows={3}
                                                        className="border border-neutral-300"
                                                        value={item.description ?? ""}
                                                        onChange={(e) => update({ description: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <Field label="Video URL (optional)">
                                                    <Input
                                                        className="h-10 border border-neutral-300"
                                                        value={item.video ?? ""}
                                                        onChange={(e) => update({ video: e.target.value })}
                                                        placeholder="https://..."
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12">
                                                <Field label="Additional Text (optional)">
                                                    <Textarea
                                                        rows={4}
                                                        className="border border-neutral-300"
                                                        value={item.text ?? ""}
                                                        onChange={(e) => update({ text: e.target.value })}
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

/** Per-item Image field (Keep | File | URL | Clear) with preview */
function ItemImageField({
    item,
    update,
}: {
    item: PortfolioItemForm;
    update: (patch: Partial<PortfolioItemForm>) => void;
}) {
    const controller = useImageController(typeof item.image === "string" ? item.image : null);

    // propagate changes to parent item when controller state changes
    useEffect(() => {
        const payload = controller.toPayload();
        if (payload === undefined) return; // keep current -> don't touch
        if (payload === item.image) return;
        update({ image: payload });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controller.mode, controller.previewUrl, controller.urlInput]);

    return (
        <div className="space-y-2">
            <Label className="text-[13px]">Image (optional)</Label>

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
                            <img
                                src={controller.previewUrl || "/placeholder.svg"}
                                alt="Preview"
                                className="h-32 w-full rounded object-cover"
                            />
                        </div>
                    )}
                </div>
            )}

            {controller.mode === "url" && (
                <div className="space-y-2">
                    <Input
                        placeholder="https://example.com/image.jpg"
                        value={controller.urlInput}
                        onChange={(e) => controller.setUrlInput(e.target.value)}
                        className="h-10 border border-neutral-300"
                    />
                    {controller.urlInput.trim() && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={controller.urlInput || "/placeholder.svg"}
                                alt="Preview"
                                className="h-32 w-full rounded object-cover"
                            />
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
        setSeed({ initialUrl });
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
                    (next as any)[idx] = { ...(next as any)[idx], ...(patch as any) };
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
function normalizeDateForInput(v: any): string | undefined {
    if (!v) return undefined;
    const d = new Date(v);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 10);
}

function normalizeNullable(v: any): string | null {
    const s = String(v ?? "").trim();
    return s ? s : null;
}

function normalizeImage(v: File | string | null | undefined): File | string | null {
    if (v instanceof File) return v;
    if (typeof v === "string") return normalizeNullable(v);
    return null;
}

function isCompletelyEmptyItem(it: {
    image?: any;
    title?: string;
    description?: string;
    date?: string;
    category?: string;
    video?: string;
    text?: string;
}) {
    const noImg = !it.image;
    const noTitle = !it.title;
    const noDesc = !it.description;
    const noDate = !it.date;
    const noCat = !it.category;
    const noVideo = !it.video;
    const noText = !it.text;
    return noImg && noTitle && noDesc && noDate && noCat && noVideo && noText;
}
