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
import type { HomeDoc } from "@/slices/homeApi";
import { useGetHomeByIdQuery } from "@/slices/homeApi";
import type { RecordItem } from ".";

type ImageMode = "keep" | "file" | "url" | "clear";

export interface ServicePreviewForm {
    title: string;
    description: string;
    keyServices: string[]; // comma-separated input, stored as array
}

interface HomeModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: RecordItem;
    onSave: (payload: {
        id?: string;
        siteName: string;
        logoImage?: File | string | null;
        brandsPreviewImage?: (File | string | null)[];
        servicesPreview?: ServicePreviewForm[];
        hero?: File | string | null;
        title: string;
        description: string;
    }) => Promise<boolean>;
    onDelete?: (id: string) => void;
}

export default function HomeModal({ open, onOpenChange, initial, onSave, onDelete }: HomeModalProps) {
    // ---------------- form state ----------------
    const [submitting, setSubmitting] = useState(false);

    const [siteName, setSiteName] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Images: logo, hero, brands (array of 4)
    const [logoImageMode, setLogoImageMode] = useState<ImageMode>("file");
    const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
    const [logoImageUrl, setLogoImageUrl] = useState<string>("");

    const [heroType, setHeroType] = useState<"image" | "video">("image");
    const [heroImageMode, setHeroImageMode] = useState<ImageMode>("file");
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [heroImageUrl, setHeroImageUrl] = useState<string>("");
    const [heroVideoUrl, setHeroVideoUrl] = useState<string>("");

    // Brands preview images (array of 4)
    const [brandsImages, setBrandsImages] = useState<(File | string | null)[]>([]);

    // Services preview (array of 4)
    const [servicesPreview, setServicesPreview] = useState<ServicePreviewForm[]>([]);

    const [touched, setTouched] = useState({ siteName: false, title: false });

    // fetch full home when editing to seed all fields
    const homeId = initial?.id || "";
    const { data: homeData } = useGetHomeByIdQuery(homeId, { skip: !homeId });

    // seed from initial / homeData
    useEffect(() => {
        if (initial && homeData) {
            const src = (homeData as HomeDoc);

            setSiteName(src.siteName ?? "");
            setTitle(src.title ?? "");
            setDescription(src.description ?? "");

            // Logo image
            if (src.logoImage) {
                setLogoImageMode("keep");
                setLogoImageUrl(src.logoImage);
            } else {
                setLogoImageMode("file");
                setLogoImageUrl("");
            }
            setLogoImageFile(null);

            // Hero image/video - detect if it's a video by checking common video extensions or URL pattern
            if (src.hero) {
                const heroUrl = String(src.hero);
                const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(heroUrl) ||
                    heroUrl.includes('youtube.com') ||
                    heroUrl.includes('youtu.be') ||
                    heroUrl.includes('vimeo.com') ||
                    heroUrl.includes('video');

                if (isVideo) {
                    setHeroType("video");
                    setHeroVideoUrl(heroUrl);
                } else {
                    setHeroType("image");
                    setHeroImageMode("keep");
                    setHeroImageUrl(heroUrl);
                }
            } else {
                setHeroType("image");
                setHeroImageMode("file");
                setHeroImageUrl("");
                setHeroVideoUrl("");
            }
            setHeroImageFile(null);

            // Brands preview images (array of 4)
            setBrandsImages(Array.isArray(src.brandsPreviewImage) ? [...src.brandsPreviewImage] : []);

            // Services preview (array of 4)
            setServicesPreview(
                Array.isArray(src.servicesPreview)
                    ? src.servicesPreview.map((svc) => ({
                        title: svc.title ?? "",
                        description: svc.description ?? "",
                        keyServices: Array.isArray(svc.keyServices) ? [...svc.keyServices] : [],
                    }))
                    : []
            );
        } else {
            // Reset form for new entry
            setSiteName("");
            setTitle("");
            setDescription("");
            setLogoImageMode("file");
            setLogoImageFile(null);
            setLogoImageUrl("");
            setHeroType("image");
            setHeroImageMode("file");
            setHeroImageFile(null);
            setHeroImageUrl("");
            setHeroVideoUrl("");
            setBrandsImages([]);
            setServicesPreview([]);
        }
        setTouched({ siteName: false, title: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, open, homeData]);

    const missing = useMemo(() => ({ siteName: !siteName.trim(), title: !title.trim() }), [siteName, title]);
    const disabled = Object.values(missing).some(Boolean);

    // ---------------- submit ----------------
    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setTouched({ siteName: true, title: true });
        if (disabled) return;

        setSubmitting(true);

        // Normalize logo image
        let logoImagePayload: File | string | null | undefined = undefined;
        switch (logoImageMode) {
            case "keep":
                logoImagePayload = undefined;
                break;
            case "file":
                logoImagePayload = logoImageFile ?? undefined;
                break;
            case "url":
                logoImagePayload = logoImageUrl.trim() || null;
                break;
            case "clear":
                logoImagePayload = null;
                break;
        }

        // Normalize hero image/video
        let heroImagePayload: File | string | null | undefined = undefined;
        if (heroType === "video") {
            heroImagePayload = heroVideoUrl.trim() || null;
        } else {
            switch (heroImageMode) {
                case "keep":
                    heroImagePayload = undefined;
                    break;
                case "file":
                    heroImagePayload = heroImageFile ?? undefined;
                    break;
                case "url":
                    heroImagePayload = heroImageUrl.trim() || null;
                    break;
                case "clear":
                    heroImagePayload = null;
                    break;
            }
        }

        // Normalize brands images - ensure we have exactly 4 or empty array
        const brandsImagesPayload: (File | string | null)[] = brandsImages.length > 0 ? brandsImages.slice(0, 4) : [];

        // Normalize services preview - ensure we have exactly 4 or empty array
        const servicesPreviewPayload: ServicePreviewForm[] = servicesPreview.slice(0, 4).map((svc) => ({
            title: String(svc.title ?? "").trim(),
            description: String(svc.description ?? "").trim(),
            keyServices: Array.isArray(svc.keyServices)
                ? svc.keyServices.map((s) => String(s).trim()).filter(Boolean)
                : [],
        }));

        const payload = {
            id: initial?.id,
            siteName: siteName.trim(),
            logoImage: logoImagePayload,
            brandsPreviewImage: brandsImagesPayload,
            servicesPreview: servicesPreviewPayload,
            hero: heroImagePayload,
            title: title.trim(),
            description: description.trim(),
        };

        const ok = await onSave(payload);
        if (ok) onOpenChange(false);
        setSubmitting(false);
    };

    // ---------------- UI ----------------
    const logoPreviewUrl = usePreviewUrl(logoImageFile);
    const heroPreviewUrl = usePreviewUrl(heroImageFile);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-4xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[85vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{initial ? "Edit home settings" : "Create home settings"}</DialogTitle>
                        <DialogDescription className="text-[13px]">
                            Required fields are marked with <span className="font-semibold">*</span>.
                            Brands and Services previews should have exactly 4 items each.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Body */}
                    <div className="px-6 py-5 overflow-y-auto">
                        {/* Core Information */}
                        <Section title="Core Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="siteName" className="text-[13px]">
                                        Site Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="siteName"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        onBlur={() => setTouched((t) => ({ ...t, siteName: true }))}
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                    {touched.siteName && missing.siteName && (
                                        <p className="mt-1 text-xs text-red-600">Please enter a site name.</p>
                                    )}
                                </div>

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

                                <div className="md:col-span-2">
                                    <Label htmlFor="description" className="text-[13px]">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-2 border border-neutral-300"
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Images */}
                        <Section title="Images">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Logo Image */}
                                <div>
                                    <ImageField
                                        label="Logo Image"
                                        mode={logoImageMode}
                                        setMode={setLogoImageMode}
                                        file={logoImageFile}
                                        setFile={setLogoImageFile}
                                        url={logoImageUrl}
                                        setUrl={setLogoImageUrl}
                                        initialUrl={initial?.logoImage ?? null}
                                        previewUrl={logoPreviewUrl}
                                    />
                                </div>

                                {/* Hero Image/Video */}
                                <div>
                                    <HeroField
                                        heroType={heroType}
                                        setHeroType={setHeroType}
                                        imageMode={heroImageMode}
                                        setImageMode={setHeroImageMode}
                                        imageFile={heroImageFile}
                                        setImageFile={setHeroImageFile}
                                        imageUrl={heroImageUrl}
                                        setImageUrl={setHeroImageUrl}
                                        videoUrl={heroVideoUrl}
                                        setVideoUrl={setHeroVideoUrl}
                                        initialUrl={initial?.hero ?? null}
                                        previewUrl={heroPreviewUrl}
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Brands Preview Images */}
                        <Section title="Brands Preview Images (exactly 4)">
                            <BrandsImageRepeater
                                items={brandsImages}
                                setItems={setBrandsImages}
                            />
                        </Section>

                        {/* Services Preview */}
                        <Section title="Services Preview (exactly 4)">
                            <ServicesPreviewRepeater
                                items={servicesPreview}
                                setItems={setServicesPreview}
                            />
                        </Section>
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

function HeroField({
    heroType,
    setHeroType,
    imageMode,
    setImageMode,
    imageFile,
    setImageFile,
    imageUrl,
    setImageUrl,
    videoUrl,
    setVideoUrl,
    initialUrl,
    previewUrl,
}: {
    heroType: "image" | "video";
    setHeroType: (t: "image" | "video") => void;
    imageMode: ImageMode;
    setImageMode: (m: ImageMode) => void;
    imageFile: File | null;
    setImageFile: (f: File | null) => void;
    imageUrl: string;
    setImageUrl: (s: string) => void;
    videoUrl: string;
    setVideoUrl: (s: string) => void;
    initialUrl: string | null;
    previewUrl: string | null;
}) {
    // Detect if initial URL is a video
    const isInitialVideo = initialUrl ? (
        /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(initialUrl) ||
        initialUrl.includes('youtube.com') ||
        initialUrl.includes('youtu.be') ||
        initialUrl.includes('vimeo.com') ||
        initialUrl.includes('video')
    ) : false;

    return (
        <div className="space-y-2">
            <Label className="text-[13px]">Hero Background</Label>

            {/* Type selector: Image or Video */}
            <div className="flex flex-wrap gap-2 mb-3">
                <Button
                    type="button"
                    variant={heroType === "image" ? "default" : "outline"}
                    onClick={() => setHeroType("image")}
                    size="sm"
                >
                    Image
                </Button>
                <Button
                    type="button"
                    variant={heroType === "video" ? "default" : "outline"}
                    onClick={() => setHeroType("video")}
                    size="sm"
                >
                    Video
                </Button>
            </div>

            {heroType === "image" ? (
                <ImageField
                    label=""
                    mode={imageMode}
                    setMode={setImageMode}
                    file={imageFile}
                    setFile={setImageFile}
                    url={imageUrl}
                    setUrl={setImageUrl}
                    initialUrl={isInitialVideo ? null : initialUrl}
                    previewUrl={previewUrl}
                />
            ) : (
                <VideoField
                    videoUrl={videoUrl}
                    setVideoUrl={setVideoUrl}
                    initialUrl={isInitialVideo ? initialUrl : null}
                />
            )}
        </div>
    );
}

function VideoField({
    videoUrl,
    setVideoUrl,
    initialUrl,
}: {
    videoUrl: string;
    setVideoUrl: (s: string) => void;
    initialUrl: string | null;
}) {
    const [mode, setMode] = useState<"keep" | "url" | "clear">(
        initialUrl ? "keep" : "url"
    );

    // When switching to URL mode and videoUrl is empty but initialUrl exists, populate it
    useEffect(() => {
        if (mode === "url" && !videoUrl && initialUrl) {
            setVideoUrl(initialUrl);
        }
    }, [mode, initialUrl, videoUrl, setVideoUrl]);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={mode === "keep" ? "default" : "outline"}
                    onClick={() => setMode("keep")}
                    disabled={!initialUrl}
                    size="sm"
                >
                    Keep current
                </Button>
                <Button
                    type="button"
                    variant={mode === "url" ? "default" : "outline"}
                    onClick={() => setMode("url")}
                    size="sm"
                >
                    Use URL
                </Button>
                <Button
                    type="button"
                    variant={mode === "clear" ? "default" : "outline"}
                    onClick={() => {
                        setMode("clear");
                        setVideoUrl("");
                    }}
                    size="sm"
                >
                    Remove
                </Button>
            </div>

            {mode === "keep" && initialUrl && (
                <div className="rounded border p-3">
                    <div className="text-xs text-neutral-600 mb-2">Current video</div>
                    <video
                        src={initialUrl}
                        controls
                        className="h-32 w-full rounded object-cover"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {mode === "url" && (
                <div className="space-y-2">
                    <Input
                        placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="h-10 border border-neutral-300"
                    />
                    {videoUrl.trim() && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            <video
                                src={videoUrl}
                                controls
                                className="h-32 w-full rounded object-cover"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </div>
            )}

            {mode === "clear" && <p className="text-xs text-neutral-500">Video will be removed.</p>}
        </div>
    );
}

function ImageField({
    label,
    mode,
    setMode,
    file,
    setFile,
    url,
    setUrl,
    initialUrl,
    previewUrl,
}: {
    label: string;
    mode: ImageMode;
    setMode: (m: ImageMode) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    url: string;
    setUrl: (s: string) => void;
    initialUrl: string | null;
    previewUrl: string | null;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-[13px]">{label}</Label>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={mode === "keep" ? "default" : "outline"}
                    onClick={() => setMode("keep")}
                    disabled={!initialUrl}
                    size="sm"
                >
                    Keep current
                </Button>
                <Button type="button" variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")} size="sm">
                    Upload file
                </Button>
                <Button type="button" variant={mode === "url" ? "default" : "outline"} onClick={() => setMode("url")} size="sm">
                    Use URL
                </Button>
                <Button
                    type="button"
                    variant={mode === "clear" ? "default" : "outline"}
                    onClick={() => {
                        setMode("clear");
                        setFile(null);
                        setUrl("");
                    }}
                    size="sm"
                >
                    Remove
                </Button>
            </div>

            {mode === "keep" && initialUrl && (
                <div className="rounded border p-3">
                    <div className="text-xs text-neutral-600 mb-2">Current image</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={initialUrl} alt="Current" className="h-32 w-full rounded object-cover" />
                </div>
            )}

            {mode === "file" && (
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="h-10"
                    />
                    {(previewUrl || initialUrl) && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl || initialUrl || ""} alt="Preview" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {mode === "url" && (
                <div className="space-y-2">
                    <Input
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-10 border border-neutral-300"
                    />
                    {url.trim() && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="Preview" className="h-32 w-full rounded object-cover" />
                        </div>
                    )}
                </div>
            )}

            {mode === "clear" && <p className="text-xs text-neutral-500">Image will be removed.</p>}
        </div>
    );
}

function BrandsImageRepeater({
    items,
    setItems,
}: {
    items: (File | string | null)[];
    setItems: (items: (File | string | null)[]) => void;
}) {
    const imgBase = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

    const addItem = () => {
        if (items.length >= 4) return;
        setItems([...items, null]);
    };

    const updateItem = (index: number, value: File | string | null) => {
        const next = [...items];
        next[index] = value;
        setItems(next);
    };

    const removeItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        setItems(next);
    };

    // Ensure we show exactly 4 slots (fill with null if needed)
    const displayItems = Array.from({ length: 4 }, (_, i) => items[i] ?? null);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Brand Images ({items.length}/4)</h4>
                {items.length < 4 && (
                    <Button type="button" onClick={addItem} className="bg-[#B5040F] hover:bg-[#a1040e]" size="sm">
                        Add Image
                    </Button>
                )}
            </div>

            {displayItems.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-neutral-300 p-3 space-y-2">
                    <Label className="text-xs">Brand Image {idx + 1}</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) updateItem(idx, file);
                        }}
                        className="h-9"
                    />
                    {typeof item === "string" && item && (
                        <div className="rounded border p-2">
                            <div className="text-xs text-neutral-600 mb-1">Current: {item}</div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const url = prompt("Enter image URL:", item);
                                    if (url !== null) updateItem(idx, url.trim() || null);
                                }}
                            >
                                Change URL
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="ml-2"
                                onClick={() => updateItem(idx, null)}
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ServicesPreviewRepeater({
    items,
    setItems,
}: {
    items: ServicePreviewForm[];
    setItems: (items: ServicePreviewForm[]) => void;
}) {
    const blankItem: ServicePreviewForm = {
        title: "",
        description: "",
        keyServices: [],
    };

    const addItem = () => {
        if (items.length >= 4) return;
        setItems([...items, { ...blankItem }]);
    };

    const updateItem = (index: number, patch: Partial<ServicePreviewForm>) => {
        const next = [...items];
        next[index] = { ...next[index], ...patch };
        setItems(next);
    };

    const removeItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        setItems(next);
    };

    // Ensure we show exactly 4 slots
    const displayItems = Array.from({ length: 4 }, (_, i) => items[i] ?? { ...blankItem });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Services ({items.length}/4)</h4>
                {items.length < 4 && (
                    <Button type="button" onClick={addItem} className="bg-[#B5040F] hover:bg-[#a1040e]" size="sm">
                        Add Service
                    </Button>
                )}
            </div>

            {displayItems.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-neutral-300 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Service {idx + 1}</Label>
                        {items[idx] && (
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(idx)}>
                                Remove
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                                value={item.title}
                                onChange={(e) => updateItem(idx, { title: e.target.value })}
                                className="h-9 border border-neutral-300"
                                placeholder="Service title"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateItem(idx, { description: e.target.value })}
                                className="border border-neutral-300"
                                placeholder="Service description"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Key Services (comma separated)</Label>
                            <Input
                                value={Array.isArray(item.keyServices) ? item.keyServices.join(", ") : ""}
                                onChange={(e) => {
                                    const services = e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                    updateItem(idx, { keyServices: services });
                                }}
                                className="h-9 border border-neutral-300"
                                placeholder="e.g. Video Production, Editing, Color Grading"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
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
            if (ref.current) {
                URL.revokeObjectURL(ref.current);
                ref.current = null;
            }
        };
    }, [file]);

    return url;
}
