// app/(admin)/brands/modal.tsx
"use client"

import type React from "react"
import type { RecordItem, FeaturedItem, PFItem, CatItem, ReviewItem } from "./types"
import type { PublishStatus } from "@/slices/brandApi"
import { useGetBrandQuery } from "@/slices/brandApi"

import { useEffect, useMemo, useRef, useState } from "react"
import { BASE_URL } from "@/lib/baseURL"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BRAND = "#B5040F"
const STATUSES: PublishStatus[] = ["draft", "published"]
const ALLOWED_SLUGS = ["asal-tv", "jiil-media", "masrax-production", "nasiye"] as const
type AllowedSlug = (typeof ALLOWED_SLUGS)[number]
type ImageMode = "keep" | "file" | "url" | "clear"

interface BrandModalProps {
    open: boolean
    onOpenChange: (v: boolean) => void
    initial?: RecordItem &
    Partial<{
        heroTitle: string
        heroDescription: string
        heroBgImage: string | null
        aboutTitle: string
        aboutDescription: string
        aboutImage: string | null
        featuredDescription: string
        featuredItems: FeaturedItem[]
        platformFeaturesDescription?: string
        platformFeatures?: PFItem[]
        contentCategoriesDescription?: string
        contentCategories?: CatItem[]
        screenshotTitle?: string
        screenshotImage?: string | null
        reviewsTitle?: string
        userReviews?: ReviewItem[]
    }>
    onSave: (payload: {
        id?: string
        name: string
        slug: AllowedSlug
        status?: PublishStatus
        order?: number
        heroTitle?: string
        heroDescription?: string
        heroBgImage?: File | string | null
        aboutTitle?: string
        aboutDescription?: string
        aboutImage?: File | string | null
        featuredDescription?: string
        featuredItems?: FeaturedItem[]
        platformFeaturesDescription?: string
        platformFeatures?: PFItem[]
        contentCategoriesDescription?: string
        contentCategories?: CatItem[]
        screenshotTitle?: string
        screenshotImage?: File | string | null
        reviewsTitle?: string
        userReviews?: ReviewItem[]
    }) => Promise<boolean>
    onDelete?: (id: string) => void
}

export default function BrandModal({ open, onOpenChange, initial, onSave, onDelete }: BrandModalProps) {
    // ------------ form state ------------
    const [submitting, setSubmitting] = useState(false)

    // core
    const [name, setName] = useState("")
    const [slug, setSlug] = useState<AllowedSlug>("asal-tv")
    const [status, setStatus] = useState<PublishStatus>("draft")
    const [order, setOrder] = useState<number>(0)

    // hero
    const [heroTitle, setHeroTitle] = useState("")
    const [heroDescription, setHeroDescription] = useState("")
    const heroBg = useImageController(initial?.heroBgImage ?? null)

    // about
    const [aboutTitle, setAboutTitle] = useState("")
    const [aboutDescription, setAboutDescription] = useState("")
    const aboutImg = useImageController(initial?.aboutImage ?? null)

    // featured (shared by asal/jiil/masrax)
    const [featuredDescription, setFeaturedDescription] = useState("")
    const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([])

    // nasiye-only (optional for others)
    const [platformFeaturesDescription, setPlatformFeaturesDescription] = useState("")
    const [platformFeatures, setPlatformFeatures] = useState<PFItem[]>([])
    const [contentCategoriesDescription, setContentCategoriesDescription] = useState("")
    const [contentCategories, setContentCategories] = useState<CatItem[]>([])

    // screenshot
    const [screenshotTitle, setScreenshotTitle] = useState("")
    const screenshotImg = useImageController(initial?.screenshotImage ?? null)

    // reviews
    const [reviewsTitle, setReviewsTitle] = useState("")
    const [userReviews, setUserReviews] = useState<ReviewItem[]>([])

    const [touched, setTouched] = useState({ name: false, slug: false })

    // fetch full brand when editing to seed all fields
    const brandId = initial?.id || ""
    const { data: brandData } = useGetBrandQuery(brandId, { skip: !brandId })

    // seed from initial / brandData
    useEffect(() => {
        if (initial) {
            const src: any = brandData ?? initial

            setName(src.name ?? src.title ?? "")
            setSlug((src.slug as AllowedSlug) ?? "asal-tv")
            setStatus((src.status as PublishStatus) ?? "draft")
            setOrder(typeof src.order === "number" ? src.order : Number(src.order) || 0)

            setHeroTitle(src.heroTitle ?? "")
            setHeroDescription(src.heroDescription ?? "")
            heroBg.reset(src.heroBgImage ?? null)

            setAboutTitle(src.aboutTitle ?? "")
            setAboutDescription(src.aboutDescription ?? "")
            aboutImg.reset(src.aboutImage ?? null)

            setFeaturedDescription(src.featuredDescription ?? "")
            // keep existing objects; their image will be string URLs from API
            setFeaturedItems(Array.isArray(src.featuredItems) ? src.featuredItems : [])

            setPlatformFeaturesDescription(src.platformFeaturesDescription ?? "")
            setPlatformFeatures(Array.isArray(src.platformFeatures) ? src.platformFeatures : [])

            setContentCategoriesDescription(src.contentCategoriesDescription ?? "")
            setContentCategories(Array.isArray(src.contentCategories) ? src.contentCategories : [])

            setScreenshotTitle(src.screenshotTitle ?? "")
            screenshotImg.reset(src.screenshotImage ?? null)

            setReviewsTitle(src.reviewsTitle ?? "")
            setUserReviews(Array.isArray(src.userReviews) ? src.userReviews : [])
        } else {
            setName("")
            setSlug("asal-tv")
            setStatus("draft")
            setOrder(0)

            setHeroTitle("")
            setHeroDescription("")
            heroBg.reset(null)

            setAboutTitle("")
            setAboutDescription("")
            aboutImg.reset(null)

            setFeaturedDescription("")
            setFeaturedItems([])

            setPlatformFeaturesDescription("")
            setPlatformFeatures([])
            setContentCategoriesDescription("")
            setContentCategories([])

            setScreenshotTitle("")
            screenshotImg.reset(null)

            setReviewsTitle("")
            setUserReviews([])
        }
        setTouched({ name: false, slug: false })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial, open, brandData])

    const missing = useMemo(() => ({ name: !name.trim(), slug: !slug }), [name, slug])
    const disabled = Object.values(missing).some(Boolean)

    // ------------ submit ------------
    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault()
        setTouched({ name: true, slug: true })
        if (disabled) return

        setSubmitting(true)

        const payload: any = {
            id: initial?.id,
            name: name.trim(),
            slug,
            status,
            order: Number(order) || 0,

            heroTitle: heroTitle.trim(),
            heroDescription: heroDescription.trim(),
            heroBgImage: heroBg.toPayload(),

            aboutTitle: aboutTitle.trim(),
            aboutDescription: aboutDescription.trim(),
            aboutImage: aboutImg.toPayload(),
        }

        if (slug !== "nasiye") {
            payload.featuredDescription = featuredDescription.trim()
            payload.featuredItems = (featuredItems ?? [])
                .map((it) => ({
                    image: normalizeImage(it.image), // File | string | null
                    title: String(it.title ?? "").trim(),
                    description: String(it.description ?? "").trim(),
                    href: (it.href && String(it.href).trim()) || "#",
                    order: Number(it.order) || 0,
                }))
                // keep items unless they are COMPLETELY empty rows
                .filter((it) => !isCompletelyEmptyFeatured(it))
        } else {
            payload.platformFeaturesDescription = platformFeaturesDescription.trim()
            payload.platformFeatures = (platformFeatures ?? [])
                .map((it) => ({
                    image: normalizeNullable(it.image),
                    title: String(it.title || "").trim(),
                    description: String(it.description || "").trim(),
                }))
                .filter((it) => it.title || it.description || it.image)

            payload.contentCategoriesDescription = contentCategoriesDescription.trim()
            payload.contentCategories = (contentCategories ?? [])
                .map((it) => ({
                    title: String(it.title || "").trim(),
                    subtitle: String(it.subtitle || "").trim(),
                }))
                .filter((it) => it.title || it.subtitle)

            payload.screenshotTitle = screenshotTitle.trim()
            payload.screenshotImage = screenshotImg.toPayload()

            payload.reviewsTitle = reviewsTitle.trim()
            payload.userReviews = (userReviews ?? [])
                .map((r) => ({
                    stars: clamp(Math.round(Number(r.stars ?? 5)), 1, 5),
                    message: String(r.message || "").trim(),
                    person: String(r.person || "").trim(),
                }))
                .filter((r) => r.message && r.person)
        }

        const ok = await onSave(payload)
        if (ok) onOpenChange(false)
        setSubmitting(false)
    }

    const isNasiye = slug === "nasiye"

    // ------------ UI ------------
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 sm:max-w-3xl overflow-hidden">
                <form onSubmit={handleSave} className="flex max-h-[80vh] flex-col">
                    {/* Header */}
                    <DialogHeader className="sticky top-0 z-10 space-y-1 border-b bg-white px-6 py-4">
                        <DialogTitle className="text-lg">{initial ? "Edit brand" : "Create brand"}</DialogTitle>
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
                                    <Label htmlFor="name" className="text-[13px]">
                                        Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                        className="mt-2 h-10 border border-neutral-300 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                                        style={{ ["--brand" as any]: BRAND }}
                                    />
                                    {touched.name && missing.name && <p className="mt-1 text-xs text-red-600">Please enter a name.</p>}
                                </div>

                                <div>
                                    <Label className="text-[13px]">
                                        Slug <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={slug} onValueChange={(v) => setSlug(v as AllowedSlug)}>
                                        <SelectTrigger className="mt-2 h-10 border border-neutral-300">
                                            <SelectValue placeholder="Select slug" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALLOWED_SLUGS.map((s) => (
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
                        </Section>

                        {/* Hero */}
                        <Section title="Hero">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-[13px]">Hero Title</Label>
                                    <Input
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[13px]">Hero Description</Label>
                                    <Input
                                        value={heroDescription}
                                        onChange={(e) => setHeroDescription(e.target.value)}
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <ImageField label="Hero Background Image" controller={heroBg} />
                            </div>
                        </Section>

                        {/* About */}
                        <Section title="About">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-[13px]">About Title</Label>
                                    <Input
                                        value={aboutTitle}
                                        onChange={(e) => setAboutTitle(e.target.value)}
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[13px]">About Description</Label>
                                    <Input
                                        value={aboutDescription}
                                        onChange={(e) => setAboutDescription(e.target.value)}
                                        className="mt-2 h-10 border border-neutral-300"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <ImageField label="About Side Image" controller={aboutImg} />
                            </div>
                        </Section>

                        {/* Featured (Programs/Content/Projects) -> only non-Nasiye */}
                        {!isNasiye && (
                            <Section title="Featured List">
                                <div className="mb-4">
                                    <Label className="text-[13px]">Section Description</Label>
                                    <Textarea
                                        rows={3}
                                        value={featuredDescription}
                                        onChange={(e) => setFeaturedDescription(e.target.value)}
                                        className="mt-2 border border-neutral-300"
                                    />
                                </div>

                                <Repeater<FeaturedItem>
                                    title="Items"
                                    items={featuredItems}
                                    setItems={setFeaturedItems}
                                    blankItem={{ image: null, title: "", description: "", href: "#", order: 0 }}
                                >
                                    {(item, update, index, duplicate, remove) => (
                                        <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-12 md:col-span-5">
                                                    <Field label="Title">
                                                        <Input
                                                            className="h-10 border border-neutral-300"
                                                            value={item.title}
                                                            onChange={(e) => update({ title: e.target.value })}
                                                        />
                                                    </Field>
                                                </div>

                                                <div className="col-span-12 md:col-span-7">
                                                    <FeaturedItemImageField item={item} update={update} />
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

                                                <div className="col-span-6">
                                                    <Field label="Button Link (href)">
                                                        <Input
                                                            className="h-10 border border-neutral-300"
                                                            value={item.href ?? "#"}
                                                            onChange={(e) => update({ href: e.target.value })}
                                                        />
                                                    </Field>
                                                </div>
                                                <div className="col-span-6">
                                                    <Field label="Order">
                                                        <Input
                                                            type="number"
                                                            className="h-10 border border-neutral-300"
                                                            value={String(item.order ?? 0)}
                                                            onChange={(e) => update({ order: Number(e.target.value) || 0 })}
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
                        )}

                        {/* Nasiye-only sections */}
                        {isNasiye && (
                            <>
                                <Section title="Platform Features">
                                    <div className="mb-4">
                                        <Label className="text-[13px]">Section Description</Label>
                                        <Textarea
                                            rows={3}
                                            value={platformFeaturesDescription}
                                            onChange={(e) => setPlatformFeaturesDescription(e.target.value)}
                                            className="mt-2 border border-neutral-300"
                                        />
                                    </div>

                                    <Repeater<PFItem>
                                        title="Features"
                                        items={platformFeatures}
                                        setItems={setPlatformFeatures}
                                        blankItem={{ image: "", title: "", description: "" }}
                                    >
                                        {(item, update, index, duplicate, remove) => (
                                            <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                                <div className="grid grid-cols-12 gap-3">
                                                    <div className="col-span-5">
                                                        <Field label="Title">
                                                            <Input
                                                                className="h-10 border border-neutral-300"
                                                                value={item.title}
                                                                onChange={(e) => update({ title: e.target.value })}
                                                            />
                                                        </Field>
                                                    </div>
                                                    <div className="col-span-5">
                                                        <Field label="Image URL">
                                                            <Input
                                                                className="h-10 border border-neutral-300"
                                                                value={(item.image as string) ? (typeof item.image === "string" && item.image.length > 100 ? "Image loaded (too long to display)" : item.image) : ""}
                                                                onChange={(e) => update({ image: e.target.value })}
                                                                placeholder="/uploads/... or https://..."
                                                            />
                                                        </Field>
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

                                <Section title="Content Categories">
                                    <div className="mb-4">
                                        <Label className="text-[13px]">Section Description</Label>
                                        <Textarea
                                            rows={3}
                                            value={contentCategoriesDescription}
                                            onChange={(e) => setContentCategoriesDescription(e.target.value)}
                                            className="mt-2 border border-neutral-300"
                                        />
                                    </div>

                                    <Repeater<CatItem>
                                        title="Categories"
                                        items={contentCategories}
                                        setItems={setContentCategories}
                                        blankItem={{ title: "", subtitle: "" }}
                                    >
                                        {(item, update, index, duplicate, remove) => (
                                            <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <Field label="Title">
                                                        <Input
                                                            className="h-10 border border-neutral-300"
                                                            value={item.title}
                                                            onChange={(e) => update({ title: e.target.value })}
                                                        />
                                                    </Field>
                                                    <Field label="Subtitle">
                                                        <Input
                                                            className="h-10 border border-neutral-300"
                                                            value={item.subtitle ?? ""}
                                                            onChange={(e) => update({ subtitle: e.target.value })}
                                                        />
                                                    </Field>
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

                                <Section title="App Screenshot (optional)">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Label className="text-[13px]">Screenshot Title</Label>
                                            <Input
                                                value={screenshotTitle}
                                                onChange={(e) => setScreenshotTitle(e.target.value)}
                                                className="mt-2 h-10 border border-neutral-300"
                                            />
                                        </div>
                                        <ImageField label="Screenshot Image" controller={screenshotImg} />
                                    </div>
                                </Section>

                                <Section title="User Reviews">
                                    <div className="mb-2">
                                        <Label className="text-[13px]">Reviews Title</Label>
                                        <Input
                                            value={reviewsTitle}
                                            onChange={(e) => setReviewsTitle(e.target.value)}
                                            className="mt-2 h-10 border border-neutral-300"
                                        />
                                    </div>

                                    <Repeater<ReviewItem>
                                        title="Reviews"
                                        items={userReviews}
                                        setItems={setUserReviews}
                                        blankItem={{ stars: 5, message: "", person: "" }}
                                    >
                                        {(item, update, index, duplicate, remove) => (
                                            <div className="rounded-lg border border-neutral-300 p-3 space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <Field label="Stars (1–5)">
                                                        <Select
                                                            value={String(clamp(Number(item.stars || 5), 1, 5))}
                                                            onValueChange={(v) => update({ stars: clamp(Number(v), 1, 5) })}
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
                                                    <Field label="Person">
                                                        <Input
                                                            className="h-10 border border-neutral-300"
                                                            value={item.person}
                                                            onChange={(e) => update({ person: e.target.value })}
                                                            placeholder='e.g. "- Sarah M."'
                                                        />
                                                    </Field>
                                                    <div className="md:col-span-2">
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
                            </>
                        )}
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
    )
}

/* ---------------- helpers & subcomponents ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-7">
            <h3 className="mb-3 text-sm font-semibold text-neutral-700">{title}</h3>
            <div className="rounded-lg border border-neutral-200 p-4">{children}</div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="text-[13px]">{label}</Label>
            <div className="mt-2">{children}</div>
        </div>
    )
}

type ImageController = ReturnType<typeof useImageController>
function ImageField({ label, controller }: { label: string; controller: ImageController }) {
    const preview = controller.previewUrl || (controller.initialUrl ?? "")
    return (
        <div className="space-y-2">
            <Label className="text-[13px]">{label}</Label>

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
                <Button
                    type="button"
                    variant={controller.mode === "clear" ? "default" : "outline"}
                    onClick={controller.setClear}
                >
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
                        onChange={async (e) => {
                            const f = e.target.files?.[0] || null
                            if (!f) {
                                controller.onFile(null)
                                return
                            }
                            // Upload immediately and switch to URL mode to avoid nulls
                            const fd = new FormData()
                            fd.append("image", f)
                            try {
                                const res = await fetch(`${BASE_URL}/uploads`, { method: "POST", body: fd, credentials: "include" })
                                if (!res.ok) throw new Error("upload failed")
                                const data = await res.json().catch(() => ({} as any))
                                const name = data?.filename || data?.data?.filename || (data?.path ? data.path.split(/[/\\]/).pop() : undefined)
                                const url = data?.url || data?.data?.url || (name ? `/uploads/${name}` : undefined) || data?.path
                                if (typeof url === "string") {
                                    controller.setUrl()
                                    controller.setUrlInput(url)
                                } else {
                                    // fallback to local preview only
                                    controller.onFile(f)
                                }
                            } catch {
                                controller.onFile(f)
                            }
                        }}
                        className="h-10"
                    />
                    {preview && (
                        <div className="rounded border p-3">
                            <div className="text-xs text-neutral-600 mb-2">Preview</div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-32 w-full rounded object-cover" />
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
    )
}

/** Featured Item Image field (File | URL | Keep | Clear) */
function FeaturedItemImageField({
    item,
    update,
}: {
    item: FeaturedItem
    update: (patch: Partial<FeaturedItem>) => void
}) {
    const controller = useImageController(typeof item.image === "string" ? item.image : null)

    // Update the item whenever the controller changes
    useEffect(() => {
        const payload = controller.toPayload()
        // avoid infinite loops: only propagate when there is a meaningful change
        if (payload === undefined) return // keep mode -> do not touch parent state
        if (payload === item.image) return
        update({ image: payload })
    }, [controller.mode, controller.previewUrl, controller.urlInput, item.image, update])

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
                <Button
                    type="button"
                    variant={controller.mode === "clear" ? "default" : "outline"}
                    onClick={controller.setClear}
                >
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
                        value={controller.urlInput && controller.urlInput.length > 200 ? "Image loaded (too long to display - click to edit)" : controller.urlInput}
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
    )
}

function useImageController(initialUrl: string | null) {
    const [mode, setMode] = useState<ImageMode>(initialUrl ? "keep" : "file")
    const [file, setFile] = useState<File | null>(null)
    const [urlInput, setUrlInput] = useState<string>("")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const blobRef = useRef<string | null>(null)
    const [seed, setSeed] = useState<{ initialUrl: string | null }>({ initialUrl })

    useEffect(() => {
        setMode(initialUrl ? "keep" : "file")
        setFile(null)
        setUrlInput("")
        setPreviewUrl(null)
        setSeed({ initialUrl: initialUrl })
    }, [initialUrl])

    useEffect(() => {
        if (!file) {
            if (blobRef.current) {
                URL.revokeObjectURL(blobRef.current)
                blobRef.current = null
            }
            setPreviewUrl(null)
            return
        }
        const u = URL.createObjectURL(file)
        setPreviewUrl(u)
        blobRef.current = u
        return () => {
            if (blobRef.current) URL.revokeObjectURL(blobRef.current)
            blobRef.current = null
        }
    }, [file])

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
            setMode("clear")
            setFile(null)
            setUrlInput("")
        },
        onFile: (f: File | null) => setFile(f),
        reset: (url: string | null) => {
            setMode(url ? "keep" : "file")
            setFile(null)
            setUrlInput("")
            setPreviewUrl(null)
            setSeed({ initialUrl: url })
        },
        toPayload(): File | string | null | undefined {
            if (mode === "keep") return undefined
            if (mode === "file") return file ?? undefined
            if (mode === "url") return urlInput.trim() || null
            if (mode === "clear") return null
            return undefined
        },
    }
}

// ---------- Generic Repeater ----------
function Repeater<T>({
    title,
    items,
    setItems,
    blankItem,
    children,
}: {
    title: string
    items: T[]
    setItems: (next: T[]) => void
    blankItem: T
    children: (
        item: T,
        update: (patch: Partial<T>) => void,
        index: number,
        duplicate: () => void,
        remove: () => void,
    ) => React.ReactNode
}) {
    const add = () => setItems([...(items || []), structuredClone(blankItem)])
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
                    const next = [...items]
                    next[idx] = { ...(next[idx] as any), ...(patch as any) }
                    setItems(next)
                }
                const duplicate = () => {
                    const next = [...items]
                    next.splice(idx + 1, 0, structuredClone(it))
                    setItems(next)
                }
                const remove = () => {
                    const next = [...items]
                    next.splice(idx, 1)
                    setItems(next)
                }
                return <div key={idx}>{children(it, update, idx, duplicate, remove)}</div>
            })}

            {(!items || items.length === 0) && (
                <div className="rounded-md border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500">
                    No items yet. Click <span className="font-medium">Add</span> to create one.
                </div>
            )}
        </div>
    )
}

// ---------- utils ----------
function normalizeNullable(v: any): string | null {
    const s = String(v ?? "").trim()
    return s ? s : null
}
function normalizeImage(v: File | string | null | undefined): File | string | null {
    if (v instanceof File) return v
    if (typeof v === "string") return normalizeNullable(v)
    return null
}
function isCompletelyEmptyFeatured(it: {
    image: any
    title: string
    description?: string
    href?: string
    order?: number
}) {
    const noImg = !it.image
    const noTitle = !it.title
    const noDesc = !it.description
    const noHref = !it.href || it.href === "#"
    const noOrder = !it.order || Number(it.order) === 0
    return noImg && noTitle && noDesc && noHref && noOrder
}
function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n))
}
