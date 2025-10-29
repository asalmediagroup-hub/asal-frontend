"use client"

import { Button } from "@/components/ui/button"
import { Download, Play, X } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useLanguage } from "@/components/language-provider"
import { useState, useMemo } from "react"
import { useGetHomesQuery } from "@/slices/homeApi"
import { useTranslatedText } from "@/hooks/use-translated-content"

type BrandCard = { id: number; image: string; name: string; color: string }

// Static brand colors and names (brand-specific, not from API)
const BRAND_COLORS = ["#B5040F", "#0F6CAE", "#B80102", "#D42026"]
const BRAND_NAMES = ["Asal TV", "Jiil Media", "Masrax", "Nasiye"]

// Helper function to resolve image URL
function resolveImage(src: string | null | undefined): string {
  const PLACEHOLDER = "/placeholder.svg"
  const s = (src || "").trim()
  const isMissing = !s || s === "null" || s === "undefined" || s === "#" || s === "/"
  if (isMissing || s.startsWith("placeholder") || s.startsWith("/placeholder")) return PLACEHOLDER
  if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s)) return s
  const base = (process.env.NEXT_PUBLIC_API_IMAGE_URL || "").trim()
  if (!base) return PLACEHOLDER
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base
  const path = s.startsWith("/") ? s : `/${s}`
  return `${cleanBase}${path}`
}

// Helper function to parse YouTube time parameter (handles formats like "8s", "8", "120", etc.)
function parseYouTubeTime(timeStr: string | null): number {
  if (!timeStr) return 0
  // Remove 's' suffix if present and parse as integer
  const cleaned = timeStr.replace(/s$/i, "")
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : Math.floor(parsed)
}

// Helper function to convert YouTube URL to embed format
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v")
      const t = u.searchParams.get("t")
      if (v) {
        const startTime = parseYouTubeTime(t)
        const timeParam = startTime > 0 ? `&start=${startTime}` : ""
        return `https://www.youtube.com/embed/${v}?autoplay=1&mute=1&loop=1&playlist=${v}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${timeParam}`
      }
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "")
      const t = u.searchParams.get("t")
      if (id) {
        const startTime = parseYouTubeTime(t)
        const timeParam = startTime > 0 ? `&start=${startTime}` : ""
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${timeParam}`
      }
    }
    return url
  } catch {
    return url
  }
}

// Check if URL is a video
function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  const u = url.toLowerCase()
  return (
    /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(u) ||
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("vimeo.com") ||
    u.includes("video")
  )
}

// Motion helpers
const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
}

const lineVariant = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const wordVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function HeroSection() {
  const { t } = useLanguage()
  const prefersReducedMotion = useReducedMotion()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // Fetch home data
  const { data: homeData, isLoading } = useGetHomesQuery({ limit: 1 })
  const home = homeData?.data?.[0]

  // Translated title and description
  const translatedTitle = useTranslatedText(home?.title)
  const translatedDescription = useTranslatedText(home?.description)

  // Brand cards from API with fallback to static data
  const brandCards = useMemo(() => {
    if (home?.brandsPreviewImage && Array.isArray(home.brandsPreviewImage) && home.brandsPreviewImage.length > 0) {
      return home.brandsPreviewImage.slice(0, 4).map((image, index) => ({
        id: index + 1,
        image: resolveImage(image),
        name: BRAND_NAMES[index] || `Brand ${index + 1}`,
        color: BRAND_COLORS[index] || "#000000",
      }))
    }
    // Fallback to static data
    return [
      { id: 1, image: "/Asal TV.jpg", name: "Asal TV", color: "#B5040F" },
      { id: 2, image: "/Jiil Media.jpg", name: "Jiil Media", color: "#0F6CAE" },
      { id: 3, image: "/Masrax Logo.jpg", name: "Masrax", color: "#B80102" },
      { id: 4, image: "/Nasiye Logo.jpg", name: "Nasiye", color: "#D42026" },
    ]
  }, [home?.brandsPreviewImage])

  // Hero background (video or image)
  const heroBackground = useMemo(() => {
    if (!home?.hero) return null
    const heroUrl = home.hero.trim()
    if (!heroUrl) return null

    const isVideo = isVideoUrl(heroUrl)
    if (isVideo) {
      // Convert YouTube/watch URLs to embed format
      if (heroUrl.includes("youtube.com") || heroUrl.includes("youtu.be")) {
        return toEmbedUrl(heroUrl)
      }
      // For other video URLs, use as-is (should already start with http)
      return heroUrl
    }
    // Image URL - resolve with base URL if needed
    return resolveImage(heroUrl)
  }, [home?.hero])

  // Modal video URL (same as hero or separate)
  const modalVideoUrl = useMemo(() => {
    if (!home?.hero || !isVideoUrl(home.hero)) return "https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&start=7"
    const heroUrl = home.hero.trim()
    if (heroUrl.includes("youtube.com") || heroUrl.includes("youtu.be")) {
      try {
        const u = new URL(heroUrl)
        if (u.hostname.includes("youtube.com")) {
          const v = u.searchParams.get("v")
          const t = u.searchParams.get("t")
          if (v) {
            const startTime = parseYouTubeTime(t) || 7
            return `https://www.youtube.com/embed/${v}?autoplay=1&start=${startTime}`
          }
        }
        if (u.hostname.includes("youtu.be")) {
          const id = u.pathname.replace("/", "")
          const t = u.searchParams.get("t")
          if (id) {
            const startTime = parseYouTubeTime(t) || 7
            return `https://www.youtube.com/embed/${id}?autoplay=1&start=${startTime}`
          }
        }
      } catch {
        // fallback
      }
    }
    return heroUrl
  }, [home?.hero])

  const handleDownloadClick = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=tv.nasiye.client&hl=en_US&pli=1",
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <div className="relative">
      {/* HERO */}
      <motion.section
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerStagger}
      >
        <div className="absolute inset-0 w-full h-full">
          {/* Hero Background - Video or Image */}
          {heroBackground ? (
            isVideoUrl(home?.hero) ? (
              // Video background (YouTube embed or direct video URL)
              <iframe
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
                src={heroBackground}
                title="Background video"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{
                  pointerEvents: "none",
                  border: "none",
                }}
              />
            ) : (
              // Image background
              <img
                src={heroBackground}
                alt="Hero background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          ) : (
            // Fallback to default YouTube video
            <iframe
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
              src="https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1&loop=1&playlist=LXb3EKWsInQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&start=7"
              title="Background video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                pointerEvents: "none",
                border: "none",
              }}
            />
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 pb-28 sm:pb-32">
            {/* Headline with dynamic title */}
            <motion.div className="space-y-4" variants={containerStagger}>
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight group inline-block"
                variants={lineVariant}
              >
                {isLoading ? (
                  <span className="text-white">{t("heroTitleConnecting")} {t("heroTitleCultures")}</span>
                ) : translatedTitle ? (
                  <motion.span variants={wordVariant} className="text-white inline-block">
                    {translatedTitle}
                  </motion.span>
                ) : (
                  <>
                    <motion.span variants={wordVariant} className="text-white inline-block mr-2">
                      {t("heroTitleConnecting")}
                    </motion.span>
                    <motion.span variants={wordVariant} className="text-white inline-block">
                      {t("heroTitleCultures")}
                    </motion.span>
                  </>
                )}

                <span
                  className="block h-1 w-0 group-hover:w-full transition-all duration-500 mt-3 mx-auto"
                  style={{ backgroundColor: "#ffffff" }}
                  aria-hidden
                />
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto text-pretty leading-relaxed"
                variants={lineVariant}
                transition={{ delay: 0.15 }}
              >
                {isLoading ? (
                  t("heroSubtitleMain")
                ) : translatedDescription ? (
                  translatedDescription
                ) : (
                  t("heroSubtitleMain")
                )}
              </motion.p>
            </motion.div>

            {/* CTA Buttons — magnetic lift + shine sweep */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
              variants={lineVariant}
              transition={{ delay: 0.25 }}
            >
              {/* Primary (transparent) */}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -3, rotate: -0.3, scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                <Button
                  size="lg"
                  onClick={handleDownloadClick}
                  className="w-full sm:w-auto px-7 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 relative overflow-hidden"
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/20"
                      initial={{ x: "-120%" }}
                      whileHover={{ x: "160%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      aria-hidden
                    />
                  )}
                  <Download className="h-5 w-5 mr-2" />
                  {t("footerDownloadNasiyeTitle")}
                </Button>
              </motion.div>

              {/* Secondary (white) */}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -3, rotate: 0.3, scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                <Button
                  size="lg"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full sm:w-auto px-7 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-white text-secondary hover:bg-white/90 relative overflow-hidden"
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-black/10"
                      initial={{ x: "-120%" }}
                      whileHover={{ x: "160%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      aria-hidden
                    />
                  )}
                  <Play className="h-5 w-5 mr-2" />
                  {t("watchOurStory")}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* BRAND CARDS */}
      <div className="relative -mt-20 sm:-mt-24 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {brandCards.map((card, index) => {
              const hoverTransform = prefersReducedMotion
                ? {}
                : { y: -6, rotate: index % 2 === 0 ? 0.8 : -0.8, scale: 1.01 }

              return (
                <motion.div
                  key={card.id}
                  className="group relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-offset-2"
                  whileHover={hoverTransform}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.6 }}
                  style={{ outline: "none" }}
                  tabIndex={0}
                  aria-label={card.name}
                >
                  {/* Glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 0 2px ${card.color}1F, 0 16px 40px ${card.color}22` }}
                  />

                  {/* Bottom bar */}
                  <span
                    className="absolute inset-x-0 bottom-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: card.color }}
                  />

                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      src={card.image || "/placeholder.svg"}
                      alt={card.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ scale: 1, filter: "brightness(0.96)" }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.06, filter: "brightness(1.02)" }}
                      transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.6 }}
                    />

                    {/* Top-right chip (now actually shows on card hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
                        style={{ background: card.color }}
                      >
                        {card.name}
                      </span>
                    </div>

                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      <div className="bg-white pt-12 sm:pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" />
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-5xl mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close video"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              {isVideoUrl(home?.hero) ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={modalVideoUrl}
                  title="Watch Our Story"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&start=7"
                  title="Watch Our Story"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
