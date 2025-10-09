export interface RecordItem {
    id: string
    name?: string
    title?: string
    slug?: string
    status?: string
    order?: number
}

// === Item types for UI repeaters ===
export interface FeaturedItem {
    image?: File | string | null // File for binary upload, string for URL, null to clear
    title: string
    description?: string
    href?: string
    order?: number
}

export interface PFItem {
    image?: string | null
    title: string
    description?: string
}

export interface CatItem {
    title: string
    subtitle?: string
}

export interface ReviewItem {
    stars: number
    message: string
    person: string
}
