"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetServicesQuery } from "@/slices/serviceApi";

/* =========================================================
   Tiny in-memory cache to avoid re-translating same strings
   ========================================================= */
const trCache = new Map<string, string>();
async function tr(text: string, lang: string, translateText: (s: string) => Promise<string>) {
  const key = `${lang}::${text}`;
  if (lang === "eng") return text;
  if (trCache.has(key)) return trCache.get(key)!;
  const out = await translateText(text);
  trCache.set(key, out);
  return out;
}

// SVG placeholder (kept as-is)
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <rect width="100%" height="100%" fill="#e5e7eb"/>
    <g opacity="0.25">
      <line x1="0" y1="337.5" x2="1200" y2="337.5" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="600" y1="0" x2="600" y2="675" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="1200" y1="0" x2="0" y2="675" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="0" y1="0" x2="1200" y2="675" stroke="#cbd5e1" strokeWidth="2"/>
    </g>
    <g transform="translate(600 337.5)">
      <circle r="64" fill="none" stroke="#9ca3af" strokeWidth="3"/>
      <rect x="-22" y="-16" width="44" height="32" rx="4" fill="none" stroke="#9ca3af" strokeWidth="3"/>
      <circle cx="-8" cy="-4" r="4.5" fill="#9ca3af"/>
      <path d="M-22 8 L-8 -4 L4 6 L14 -2 L22 8" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
    </g>
  </svg>`);

/* =========
   Carousel (step-by-one)
   ========= */
function useItemsPerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < 768) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return perView;
}

function Carousel<T>({
  items,
  renderItem,
  ariaLabel,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  ariaLabel?: string;
}) {
  const perView = useItemsPerView();
  const maxStart = Math.max(0, items.length - perView);
  const [startIdx, setStartIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const programmaticRef = useRef(false);

  useEffect(() => {
    setStartIdx((s) => Math.min(s, maxStart));
  }, [maxStart, perView, items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const itemWidth = el.clientWidth / Math.max(1, perView);
    programmaticRef.current = true;
    el.scrollTo({ left: itemWidth * startIdx, behavior: "smooth" });
    const t = setTimeout(() => (programmaticRef.current = false), 300);
    return () => clearTimeout(t);
  }, [startIdx, perView]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (programmaticRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const itemWidth = el.clientWidth / Math.max(1, perView);
        const current = Math.round(el.scrollLeft / Math.max(1, itemWidth));
        if (current !== startIdx) setStartIdx(Math.min(Math.max(0, current), maxStart));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [startIdx, perView, maxStart]);

  const canPrev = startIdx > 0;
  const canNext = startIdx < maxStart;
  const dots = useMemo(() => Array.from({ length: maxStart + 1 }), [maxStart]);

  return (
    <div className="relative">
      {items.length > perView && (
        <>
          <button
            aria-label="Previous"
            disabled={!canPrev}
            onClick={() => setStartIdx((s) => Math.max(0, s - 1))}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next"
            disabled={!canNext}
            onClick={() => setStartIdx((s) => Math.min(maxStart, s + 1))}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/90 p-2 shadow disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div
        ref={scrollerRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
        aria-label={ariaLabel}
      >
        <div className="flex">
          {items.map((item, i) => (
            <div
              key={i}
              className="snap-start snap-always shrink-0 px-2"
              style={{ width: `${100 / Math.max(1, perView)}%` }}
            >
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>

      {dots.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {dots.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to position ${i + 1}`}
              onClick={() => setStartIdx(i)}
              className={`h-2 w-2 rounded-full ${i === startIdx ? "bg-primary" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/* =========
   Helpers
   ========= */

// Resolve image URL: if relative (/uploads/...), prefix with BASE_URL; else pass through.
function resolveImageUrl(src?: string | null): string {
  if (!src || !src.trim()) return PLACEHOLDER;
  const s = src.trim();
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  // handle "/uploads/..." or "uploads/..."
  if (s.startsWith("/")) return `${process.env.NEXT_PUBLIC_API_IMAGE_URL}${s}`;
  return `${process.env.NEXT_PUBLIC_API_IMAGE_URL}/${s}`;
}

function SectionSkeleton() {
  const cards = Array.from({ length: 3 });
  return (
    <div className="animate-pulse">
      <div className="h-7 w-64 mx-auto mb-8 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <div className="aspect-[16/9] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded bg-gray-200" />
                <div className="h-5 w-20 rounded bg-gray-200" />
                <div className="h-5 w-14 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========
   Service Card with dynamic translations applied
   ========= */
function ServiceCard({ service }: { service: any }) {
  const { translateText, language } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState<string>(service?.title ?? "");
  const [translatedDescription, setTranslatedDescription] = useState<string>(service?.description ?? "");
  const [translatedFeatures, setTranslatedFeatures] = useState<string[]>([]);

  // Title & description
  useEffect(() => {
    let alive = true;
    (async () => {
      const rawTitle = service?.title ?? "";
      const rawDesc = service?.description ?? "";
      const [tt, td] = await Promise.all([
        tr(rawTitle, language, translateText),
        tr(rawDesc, language, translateText),
      ]);
      if (alive) {
        setTranslatedTitle(tt);
        setTranslatedDescription(td);
      }
    })();
    return () => {
      alive = false;
    };
  }, [service?.title, service?.description, language, translateText]);

  // Features (array or comma-separated)
  useEffect(() => {
    let alive = true;
    const raw: string[] = Array.isArray(service?.features)
      ? service.features
      : typeof service?.features === "string"
        ? service.features
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
        : [];

    (async () => {
      if (raw.length === 0) {
        if (alive) setTranslatedFeatures([]);
        return;
      }
      if (language === "eng") {
        if (alive) setTranslatedFeatures(raw);
        return;
      }
      // dedupe, translate, then map back preserving order
      const unique = Array.from(new Set(raw));
      const translatedUnique = await Promise.all(unique.map((f) => tr(f, language, translateText)));
      const map = new Map<string, string>();
      unique.forEach((u, i) => map.set(u, translatedUnique[i]));
      if (alive) setTranslatedFeatures(raw.map((r) => map.get(r) || r));
    })();

    return () => {
      alive = false;
    };
  }, [service?.features, language, translateText]);

  const imgSrc = resolveImageUrl(service?.image ?? null);

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden p-0">
      <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc || "/placeholder.svg"}
          alt={translatedTitle || "Service"}
          className="h-full w-full object-cover"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== PLACEHOLDER) el.src = PLACEHOLDER;
          }}
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl">{translatedTitle || "Untitled"}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-muted-foreground mb-4">{translatedDescription || "—"}</p>
        <div className="flex flex-wrap gap-2">
          {translatedFeatures.length > 0 ? (
            translatedFeatures.map((f, j) => (
              <Badge key={j} variant="secondary" className="text-xs">
                {f}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-xs">
              Feature
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  const { t, language, translateText } = useLanguage();

  const { data, isLoading } = useGetServicesQuery?.({
    status: "published",
    sort: "order",
    limit: 1000,
  } as any) ?? {
    data: undefined,
    isLoading: false,
  };

  const UNC = t("uncategorized") || "Uncategorized";

  // Group by category name (raw)
  const groupedRaw = useMemo(() => {
    const map = new Map<string, any[]>();
    const items = data?.data ?? [];
    for (const s of items) {
      const catName = typeof s?.category === "object" ? s.category?.name ?? UNC : UNC;
      if (!map.has(catName)) map.set(catName, []);
      map.get(catName)!.push(s);
    }
    for (const [, v] of map) {
      v.sort((a, b) => {
        const ao = Number(a?.order ?? 0);
        const bo = Number(b?.order ?? 0);
        if (ao !== bo) return ao - bo;
        const ad = new Date(a?.createdAt ?? 0).getTime();
        const bd = new Date(b?.createdAt ?? 0).getTime();
        return bd - ad;
      });
    }
    return Array.from(map.entries()).map(([category, services]) => ({ category, services }));
  }, [data, UNC]);

  // Translate category names (dynamic)
  const [translatedCategories, setTranslatedCategories] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      const map = new Map<string, string>();
      for (const { category } of groupedRaw) {
        const translated = await tr(category, language, translateText);
        map.set(category, translated);
      }
      if (alive) setTranslatedCategories(map);
    })();
    return () => {
      alive = false;
    };
  }, [groupedRaw, language, translateText]);

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                {t("servicesPageTitle")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">{t("servicesPageSubtitle")}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {t("getStarted")}
              </Button>
            </div>
          </div>
        </section>

        {/* Dynamic categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {isLoading && (
              <>
                <SectionSkeleton />
                <SectionSkeleton />
              </>
            )}

            {!isLoading && groupedRaw.length === 0 && (
              <div className="text-center text-muted-foreground">{t("noServicesFound")}</div>
            )}

            {!isLoading &&
              groupedRaw.map((group, idx) => (
                <div key={idx}>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold">
                      {translatedCategories.get(group.category) || group.category || UNC}
                    </h2>
                  </div>

                  <Carousel
                    items={group.services ?? []}
                    ariaLabel={`${translatedCategories.get(group.category) || group.category || UNC} services`}
                    renderItem={(service: any, i: number) => <ServiceCard key={service?._id ?? i} service={service} />}
                  />
                </div>
              ))}
          </div>
        </section>

        {/* Our Process (static) */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ourProcess")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("ourProcessSubtitle")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: t("consultation"), description: t("consultationDesc") },
                { step: "02", title: t("planning"), description: t("planningDesc") },
                { step: "03", title: t("production"), description: t("productionDesc") },
                { step: "04", title: t("delivery"), description: t("deliveryDesc") },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA (static, LAST) */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyToStart")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{t("readyToStartSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                {t("contact")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                {t("viewPortfolio")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
