// app/(admin)/packages/modal.tsx
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

import {
    type PublishStatus,
    type PackageSlug,
    type PackageCategory,
    type PackageDoc,
    useGetPackageQuery,
} from "@/slices/packageApi";

const BRAND = "#B5040F";

const STATUSES: PublishStatus[] = ["draft", "published"];
const SLUGS: PackageSlug[] = ["religious", "social", "news", "sports"];

/** Category options constrained by slug */
const CATEGORY_BY_SLUG: Record<PackageSlug, PackageCategory[]> = {
    religious: ["Ramadan", "Quran", "Scholars", "Charity", "Education", "Iftar"],
    social: ["Initiative", "Youth", "Women", "Campaign", "Diaspora", "Volunteer", "Interfaith"],
    news: ["Platform Launch", "Award", "Production", "Expansion", "Digital", "Partnership", "Infrastructure"],
    sports: ["Football", "Basketball", "Athletics", "Community", "Volleyball", "Festival", "Infrastructure"],
};

/* ------------------------------ Types ------------------------------ */
export interface StoryItem {
    image?: File | string | null; // File (for upload) or URL or null
    title: string;
    description: string;
    author: string;
    date: string; // YYYY-MM-DD
    fullVersion: string; // full story text
    /** per-story category */
    category?: string;
}

export interface RecordItem {
    id: string;
    title: string;
    description: string;
    slug: PackageSlug;
    status: PublishStatus;
    category: PackageCategory;
    createdAt?: string;
    createdBy?: string | { name?: string; email?: string };
    featuredStories?: StoryItem[];
}

type ImageMode = "keep" | "file" | "url" | "clear";

interface PackageModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem;
    onSave: (payload: {
        id?: string;
        title: string;
        description: string;
        slug: PackageSlug;
        status?: PublishStatus;
        category: PackageCategory;
        featuredStories?: StoryItem[];
    }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}

export default function PackageModal({ open, onOpenChange, initial, onSave, onDelete }: PackageModalProps) {
    /* --------------------------- form state --------------------------- */
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [slug, setSlug] = useState<PackageSlug>("religious");
    const [status, setStatus] = useState<PublishStatus>("draft");
    const [category, setCategory] = useState<PackageCategory>("Ramadan");

    const [stories, setStories] = useState<StoryItem[]>([]);

    const [touched, setTouched] = useState({ title: false, description: false, category: false });

    // fetch up-to-date doc when editing
    const id = initial?.id || "";
    const { data: serverDoc } = useGetPackageQuery(id, { skip: !id });

    // seed
    useEffect(() => {
        const src: Partial<PackageDoc> | RecordItem | undefined = serverDoc || initial;
        if (src) {
            setTitle(String(src.title ?? ""));
            setDescription(String(src.description ?? ""));
            const s = (src.slug as PackageSlug) ?? "religious";
            setSlug(s);
            setStatus((src.status as PublishStatus) ?? "draft");

            // ensure category is valid for slug
            const allowed = CATEGORY_BY_SLUG[s];
            const nextCat = (src.category as PackageCategory) ?? allowed[0];
            setCategory(allowed.includes(nextCat) ? nextCat : allowed[0]);

            setStories(
                Array.isArray(src.featuredStories)
                    ? src.featuredStories.map((st: any) => {
                        const storyCat: PackageCategory =
                            allowed.includes(st?.category as PackageCategory)
                                ? (st.category as PackageCategory)
                                : (allowed.includes(nextCat) ? nextCat : allowed[0]);
                        return {
                            image: st.image ?? null,
                            title: String(st.title ?? ""),
                            description: String(st.description ?? ""),
                            author: String(st.author ?? ""),
                            date: String(st.date ?? ""),
                            fullVersion: String(st.fullVersion ?? ""),
                            // ensure a valid category is stored on the item
                            category: storyCat,
                        };
                    })
                    : []
            );
        } else {
            setTitle("");
            setDescription("");
            setSlug("religious");
            setStatus("draft");
            setCategory(CATEGORY_BY_SLUG["religious"][0]);
            setStories([]);
        }
        setTouched({ title: false, description: false, category: false });
    }, [initial, open, serverDoc]);

    // keep package-level category valid when slug changes (used as default for stories)
    useEffect(() => {
        const allowed = CATEGORY_BY_SLUG[slug];
        if (!allowed.includes(category)) {
            setCategory(allowed[0]);
        }
    }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

    const missing = useMemo(
        () => ({
            title: !title.trim(),
            description: !description.trim(),
            category: !category,
        }),
        [title, description, category]
    );
    const disabled = Object.values(missing).some(Boolean);

    /* ---------------------------- submit ----------------------------- */
    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ title: true, description: true, category: true });
        if (disabled) return;

        setSubmitting(true);

        const allowed = CATEGORY_BY_SLUG[slug];

        const payload = {
            id: initial?.id,
            title: title.trim(),
            description: description.trim(),
            slug,
            status,
            category, // still sent (backend likely expects it)
            featuredStories: (stories ?? [])
                .map((it) => ({
                    image: normalizeImage(it.image),
                    title: String(it.title || "").trim(),
                    description: String(it.description || "").trim(),
                    author: String(it.author || "").trim(),
                    date: String(it.date || "").trim(),
                    fullVersion: String(it.fullVersion || "").trim(),
                    // Always send a valid category: per-story if valid, else package-level
                    category: allowed.includes(it.category as PackageCategory)
                        ? (it.category as PackageCategory)
                        : category,
                }))
                .filter((it) => !isCompletelyEmptyStory(it)),
        };

        const ok = await onSave(payload);
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    const allowedCategories = CATEGORY_BY_SLUG[slug];

    /* ------------------------------ UI ------------------------------- */
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-3xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{initial ? "Edit package" : "Create package"}</DialogTitle>
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
                                    <Label htmlFor="pkg-title" className="text-[13px]">
                                        Title <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="pkg-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                                        className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2"
                                        style={{ ["--brand" as any]: BRAND }}
                                    />
                                    {touched.title && missing.title && <p className="mt-1 text-xs text-red-600">Please enter a title.</p>}
                                </div>

                                <div>
                                    <Label className="text-[13px]">
                                        Slug <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={slug} onValueChange={(v) => setSlug(v as PackageSlug)}>
                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                            <SelectValue placeholder="Select slug" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SLUGS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

                                {/* Category field removed from Core section as requested */}

                                <div className="md:col-span-2">
                                    <Label className="text-[13px]">
                                        Description <span className="text-red-600">*</span>
                                    </Label>
                                    <Textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                                        className="mt-2 border border-neutral-300"
                                    />
                                    {touched.description && missing.description && (
                                        <p className="mt-1 text-xs text-red-600">Please enter a description.</p>
                                    )}
                                </div>
                            </div>
                        </Section>

                        {/* Featured Stories */}
                        <Section title="Featured Stories">
                            <Repeater<StoryItem>
                                title="Stories"
                                items={stories}
                                setItems={setStories}
                                blankItem={{
                                    image: null,
                                    title: "",
                                    description: "",
                                    author: "",
                                    date: "",
                                    fullVersion: "",
                                    // default each new story to the (hidden) package category
                                    category, // <-- important default
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
                                                <Field label="Author">
                                                    <Input
                                                        className="h-10 border border-neutral-300"
                                                        value={item.author}
                                                        onChange={(e) => update({ author: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            {/* per-story category selector */}
                                            <div className="col-span-12 md:col-span-4">
                                                <Field label="Category">
                                                    <Select
                                                        value={
                                                            item.category && allowedCategories.includes(item.category as PackageCategory)
                                                                ? (item.category as PackageCategory)
                                                                : category
                                                        }
                                                        onValueChange={(v) => update({ category: v as PackageCategory })}
                                                    >
                                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {allowedCategories.map((c) => (
                                                                <SelectItem key={c} value={c}>
                                                                    {c}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <Field label="Date">
                                                    <Input
                                                        type="date"
                                                        className="h-10 border border-neutral-300"
                                                        value={item.date}
                                                        onChange={(e) => update({ date: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12 md:col-span-6">
                                                <StoryImageField item={item} update={update} />
                                            </div>

                                            <div className="col-span-12">
                                                <Field label="Short Description">
                                                    <Textarea
                                                        rows={3}
                                                        className="border border-neutral-300"
                                                        value={item.description}
                                                        onChange={(e) => update({ description: e.target.value })}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="col-span-12">
                                                <Field label='Full Version (shown when clicking “Read more”)'>
                                                    <Textarea
                                                        rows={6}
                                                        className="border border-neutral-300"
                                                        value={item.fullVersion}
                                                        onChange={(e) => update({ fullVersion: e.target.value })}
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

/** Story image input: File | URL | Keep | Clear (per-item controller) */
function StoryImageField({
    item,
    update,
}: {
    item: StoryItem;
    update: (patch: Partial<StoryItem>) => void;
}) {
    const controller = useImageController(typeof item.image === "string" ? item.image : null);

    // Sync up to parent item when controller changes (avoid loops)
    useEffect(() => {
        const payload = controller.toPayload();
        if (payload === undefined) return; // keep mode
        if (payload === item.image) return;
        update({ image: payload });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controller.mode, controller.previewUrl, controller.urlInput]);

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

            {controller.mode === "keep" && controller.initialUrl && controller.initialUrl.length <= 200 && (
                <div className="rounded border p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={controller.initialUrl || "/placeholder.svg"} alt="" className="h-32 w-full rounded object-cover" />
                </div>
            )}

            {controller.mode === "file" && (
                <div className="space-y-2">
                    <Input type="file" accept="image/*" onChange={(e) => controller.onFile(e.target.files?.[0] || null)} className="h-10" />
                    {controller.previewUrl && (
                        <div className="rounded border p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={controller.previewUrl || "/placeholder.svg"} alt="" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {controller.mode === "url" && (
                <div className="space-y-2">
                    <Input
                        placeholder="/uploads/... or https://example.com/image.jpg"
                        value={controller.urlInput && controller.urlInput.length > 200 ? "Image loaded (too long to display - click to edit)" : controller.urlInput}
                        onChange={(e) => controller.setUrlInput(e.target.value)}
                        className="h-10 border border-neutral-300"
                    />
                    {controller.urlInput.trim() && controller.urlInput.length <= 200 && (
                        <div className="rounded border p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={controller.urlInput || "/placeholder.svg"} alt="" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {controller.mode === "clear" && <p className="text-xs text-neutral-500">Image will be removed.</p>}
        </div>
    );
}

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
        toPayload(): File | string | null | undefined {
            if (mode === "keep") return undefined;
            if (mode === "file") return file ?? undefined;
            if (mode === "url") return urlInput.trim() || null;
            if (mode === "clear") return null;
            return undefined;
        },
    };
}

/* ----------------------- generic repeater ----------------------- */
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

/* ---------------------------- utils ---------------------------- */
function normalizeImage(v: File | string | null | undefined): File | string | null {
    if (v instanceof File) return v;
    if (typeof v === "string") {
        const s = v.trim();
        return s ? s : null;
    }
    return null;
}

function isCompletelyEmptyStory(it: {
    image: any;
    title: string;
    description?: string;
    author?: string;
    category?: string;
    date?: string;
    fullVersion?: string;
}) {
    const noImg = !it.image;
    const noTitle = !String(it.title || "").trim();
    const noDesc = !String(it.description || "").trim();
    const noAuthor = !String(it.author || "").trim();
    const noCategory = !String(it.category || "").trim();
    const noDate = !String(it.date || "").trim();
    const noFull = !String(it.fullVersion || "").trim();
    return noImg && noTitle && noCategory && noDesc && noAuthor && noDate && noFull;
}
