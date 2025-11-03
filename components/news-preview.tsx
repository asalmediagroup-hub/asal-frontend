"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useGetNewsQuery } from "@/slices/newsApi";
import { useLanguage } from "@/components/language-provider";
import { resolveImageUrl } from "@/lib/utils";

/* ------------------------ Static fallback list ------------------------ */
const FALLBACK_NEWS = [
  {
    title: "Asal Media Group Wins Regional Broadcasting Excellence Award",
    excerpt:
      "Our commitment to quality content and innovative programming has been recognized with the prestigious Regional Broadcasting Excellence Award for 2024.",
    date: "2024-01-15",
    readTime: "3 min read",
    category: "Awards",
    image: "/Asal Award.jpg",
  },
  {
    title: "Nasiye Platform Reaches 1 Million Downloads Milestone",
    excerpt:
      "The Nasiye mobile streaming platform has achieved a significant milestone, surpassing 1 million downloads across app stores in the region.",
    date: "2024-01-10",
    readTime: "2 min read",
    category: "Platform News",
    image: "/Nasiye Reach 1m dowloaded.jpg",
  },
  {
    title: "New Partnership with International Content Distributors",
    excerpt:
      "Asal Media Group announces strategic partnerships with leading international content distributors to bring premium global content to regional audiences.",
    date: "2024-01-05",
    readTime: "4 min read",
    category: "Partnerships",
    image: "/Asal Partenrship.jpg",
  },
];

/* ------------------------------ Helpers ------------------------------ */
const PLACEHOLDER = "/placeholder.svg";

// estimate words → minutes
function minutesFromText(text: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)); // number (minutes)
}


// language → BCP-47 locale
function langToLocale(lang: string | undefined) {
  if (lang === "ar") return "ar";
  if (lang === "so") return "so";
  return "en";
}

function formatDateISO(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(+d)) return dateStr;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
}

function formatReadTime(minutes: number, lang: string | undefined) {
  if (lang === "ar") return `${minutes} دقيقة قراءة`;
  if (lang === "so") return `${minutes} daqiiqo akhris`;
  return `${minutes} min read`;
}

/* ---------------------------- API → UI map ---------------------------- */
type ApiGroup = {
  status?: string;
  items?: Array<{
    date?: string;
    author?: string;
    title?: string;
    image?: string | null;
    description?: string;
    fullNews?: string;
    order?: number;
  }>;
};

function mapApiToCards(payload: any) {
  const groups: ApiGroup[] = Array.isArray(payload?.data) ? payload.data : [];
  const published = groups.filter((g) => g?.status === "published");
  const items = published.flatMap((g) => (Array.isArray(g.items) ? g.items : []));

  const cards = items.map((it) => {
    const date = it?.date || new Date().toISOString();
    const textForReadTime = it?.fullNews || it?.description || "";
    return {
      title: it?.title || "Untitled",
      excerpt: it?.description || "",
      date,
      readMinutes: minutesFromText(textForReadTime), // store as number; format later per language
      category: "News",
      image: resolveImageUrl(it?.image, PLACEHOLDER),
    };
  });

  // newest first
  cards.sort((a, b) => {
    const tA = Date.parse(a.date || "");
    const tB = Date.parse(b.date || "");
    if (Number.isFinite(tA) && Number.isFinite(tB)) return tB - tA;
    return 0;
  });

  return cards;
}

/* ------------------------------ Skeletons ------------------------------ */
function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/50 rounded-2xl p-0">
      <div className="relative w-full h-48 bg-muted animate-pulse" />
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------- Translation utilities ------------------------- */
const translateCache = new Map<string, string>();
async function trDynamic(text: string, translateText: (txt: string) => Promise<string>, langKey: string) {
  const key = `${langKey}::${text}`;
  if (translateCache.has(key)) return translateCache.get(key)!;
  try {
    const out = await translateText(text);
    translateCache.set(key, out);
    return out;
  } catch {
    return text; // graceful fallback
  }
}

/* ------------------------------ Component ------------------------------ */
export function NewsPreview() {
  const { data, isLoading, isError } = useGetNewsQuery();
  const { t, translateText, isRTL, language } = useLanguage();

  // 1) Build source items (dynamic → fallback)
  const dynamicCards = React.useMemo(() => mapApiToCards(data), [data]);
  const sourceCards = React.useMemo(
    () =>
      dynamicCards && dynamicCards.length > 0
        ? dynamicCards
        : FALLBACK_NEWS.map((c) => ({
          title: c.title,
          excerpt: c.excerpt,
          date: c.date,
          readMinutes: parseInt((c.readTime || "0").split(" ")[0]) || 2,
          category: c.category,
          image: c.image,
        })),
    [dynamicCards]
  );

  // 2) Translate dynamic titles/excerpts when language changes
  const [cards, setCards] = React.useState(sourceCards);
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      const langKey = String(language);
      const translated = await Promise.all(
        sourceCards.map(async (c) => {
          const [title, excerpt] = await Promise.all([
            trDynamic(c.title, translateText, langKey),
            trDynamic(c.excerpt || "", translateText, langKey),
          ]);
          return { ...c, title, excerpt };
        })
      );
      if (!cancelled) setCards(translated);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [sourceCards, translateText, language]);

  // 3) Slider state: show 3 at a time, shift by 1
  const [start, setStart] = React.useState(0);
  const windowSize = 3;
  const total = cards.length;

  React.useEffect(() => {
    setStart(0);
  }, [total]);

  const next = () => setStart((s) => (s + 1) % total);
  const prev = () => setStart((s) => (s - 1 + total) % total);

  // 4) Visible window
  const visible = React.useMemo(() => {
    if (total === 0) return [];
    const count = Math.min(windowSize, total);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const idx = (start + i) % total;
      arr.push({ ...cards[idx], __key: `${cards[idx].title}-${idx}` });
    }
    return arr;
  }, [cards, start, total]);

  // 5) Localization helpers
  const locale = langToLocale(language);
  const dir = isRTL ? "rtl" : "ltr";
  const align = isRTL ? "text-right" : "text-left";

  // ---- RTL/LTR header layout helpers ----
  const titleSide = isRTL ? "text-right md:justify-self-end" : "text-left md:justify-self-start";
  const controlsSide = isRTL ? "md:justify-self-start" : "md:justify-self-end";
  const controlsFlow = isRTL ? "flex-row-reverse" : "flex-row";
  const arrowSpace = isRTL ? "mr-2" : "ml-2"; // space before arrow in the correct direction

  // 6) UI labels (fallbacks if t() missing)
  const lblLatest = t?.("latest") || "Latest News";
  const lblSub =
    t?.("sub") ||
    "Stay updated with the latest developments, achievements, and announcements from Asal Media Group and our brand portfolio.";
  const lblViewAll = t?.("viewAll") || "View All News";
  const lblReadMore = t?.("readMore") || "Read More";
  const lblCategoryNews = t?.("news.category") || "News";

  const showNav = total > windowSize;

  return (
    <section className="py-24 bg-muted/30" dir={dir}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================ Header (JUSTIFY BETWEEN) ============================ */}
        <div className="grid md:grid-cols-2 items-center mb-16 gap-6">
          {/* Title + Subtitle (Right on AR, Left on LTR) */}
          <div className={`space-y-4 ${titleSide}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-[#B5040F]">
              {lblLatest}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
              {lblSub}
            </p>
          </div>

          {/* Controls (Left on AR, Right on LTR) with spacing between */}
          <div className={`w-full flex items-center justify-between gap-3 ${controlsFlow} ${controlsSide}`}>
            {showNav ? (
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                aria-label={t?.("prev") || "Prev"}
                className="hidden md:inline-flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <span className="hidden md:block" />
            )}

            <Button asChild variant="outline" size="lg" className={`${isRTL ? "flex-row-reverse" : ""}`}>
              <Link href="/news">
                <span>{lblViewAll}</span>
                <ArrowRight className={`h-4 w-4 ${arrowSpace} ${isRTL ? "-scale-x-100" : ""}`} />
              </Link>
            </Button>

            {showNav ? (
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                aria-label={t?.("next") || "Next"}
                className="hidden md:inline-flex"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              <span className="hidden md:block" />
            )}
          </div>
        </div>
        {/* ========================= /Header (JUSTIFY BETWEEN) ========================= */}

        {/* Grid / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visible.map((item, index) => (
              <Card
                key={item.__key ?? `${item.title}-${index}`}
                className="group overflow-hidden border border-border/50 hover:border-primary/20 bg-background transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] rounded-2xl p-0"
              >
                {/* Image */}
                <figure className="relative w-full h-48">
                  <Image
                    src={item.image || PLACEHOLDER}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover object-center block"
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 33vw, 100vw"
                    priority={index < 2}
                  />
                </figure>

                {/* Content */}
                <div className={`p-6 space-y-4 ${align}`}>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateISO(item.date, locale)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatReadTime(item.readMinutes as number, language)}</span>
                      </div>
                    </div>

                    {/* Per-card Read More → /news */}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-auto text-primary hover:bg-[#B5040F] hover:text-white px-2 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <Link href="/news">
                        <span className={`${isRTL ? "ml-1" : "mr-1"} group-hover:pr-1 transition-all`}>
                          {lblReadMore}
                        </span>
                        <ArrowRight
                          className={`h-4 w-4 inline-block align-middle group-hover:translate-x-1 transition-transform duration-300 ${isRTL ? "-scale-x-100" : ""}`}
                        />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Mobile prev/next under the grid */}
        {!isLoading && showNav && (
          <div className={`mt-8 flex items-center justify-center gap-4 md:hidden ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button variant="outline" size="icon" onClick={prev} aria-label={t?.("prev") || "Previous news"}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={next} aria-label={t?.("next") || "Next news"}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Optional subtle message on failure */}
        {/* {!isLoading && isError && (
          // <p className="mt-6 text-sm text-muted-foreground">
          //   {"Showing recent highlights while we load the latest news."}
          // </p>
        )} */}
      </div>
    </section>
  );
}
