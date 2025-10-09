// app/(site)/portfolio/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetPortfolioQuery, type PortfolioDoc, type PortfolioItem } from "@/slices/portfolioApi";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Film,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/components/language-provider";

/* ------------------------------ Static fallback ------------------------------ */
const STATIC_DOC: Pick<PortfolioDoc, "title" | "description" | "items"> = {
  title: "Our Portfolio",
  description:
    "Showcasing our finest work across all media platforms — documentaries, live productions, digital content and more.",
  items: [
    {
      image: "/somali-cultural-documentary-film-production.png",
      title: "Somali Heritage Documentary Series",
      description:
        "A comprehensive 12-part documentary series exploring the rich cultural heritage of Somalia and its diaspora.",
      date: "2024-05-20",
      category: "Documentary",
      video: "https://www.youtube.com/watch?v=xrRDlOWR1OU",
      text: `This docu-series explores heritage, language, art, and migration stories across generations…`,
    },
    {
      image: "/youth-podcast-studio-modern-recording-setup.png",
      title: "Youth Voices Podcast Network",
      description:
        "A network of podcasts featuring young East African voices discussing technology and social change.",
      date: "2024-03-11",
      category: "Digital Content",
      video: "",
      text: `Behind-the-scenes and impact notes for the pilot season…`,
    },
    {
      image: "/mogadishu-city-skyline-modern-development-commerci.png",
      title: "Mogadishu Rising",
      description:
        "A cinematic commercial showcasing the economic revival and modern development of Mogadishu.",
      date: "2023-09-04",
      category: "Commercial",
      video: "",
      text: "",
    },
    {
      image: "/somali-drama-series-modern-production-streaming.png",
      title: "Nasiye Original Series Launch",
      description:
        "Launch campaign for Nasiye's first original drama series, featuring contemporary Somali storytelling.",
      date: "2024-07-01",
      category: "Streaming Content",
      video: "https://www.youtube.com/watch?v=mCFMn0UkRt0",
      text: "",
    },
    {
      image: "",
      title: "East Africa Business Summit",
      description:
        "Live coverage and production of the annual East Africa Business Summit, featuring key industry leaders.",
      date: "2024-10-02",
      category: "Live Event",
      video: "",
      text: "",
    },
    {
      image: "/african-digital-nomads-entrepreneurs-working-remot.png",
      title: "Digital Nomads of Africa",
      description:
        "A web series following young African entrepreneurs and digital nomads across the continent.",
      date: "2023-11-13",
      category: "Web Series",
      video: "",
      text: `Episode summaries, field notes and outcomes…`,
    },
  ],
};

const PLACEHOLDER = "/placeholder.svg";
const PAGE_SIZE = 6;
const ALL_VALUE = "__ALL__";

/* ------------------------------ Component ------------------------------ */
export default function PortfolioPage() {
  const { t, language, translateText } = useLanguage();

  const { data, isLoading, isError } = useGetPortfolioQuery({ page: 1, limit: 1 });

  // Use API doc if available otherwise static
  const doc: Pick<PortfolioDoc, "title" | "description" | "items"> = useMemo(() => {
    const d = data?.data?.[0];
    if (d && Array.isArray(d.items) && d.items.length) {
      return {
        title: d.title || t("portfolioTitle"),
        description: d.description || STATIC_DOC.description,
        items: d.items,
      };
    }
    return STATIC_DOC;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ------------------------------ i18n: translate dynamic content ------------------------------ */
  const [translatedTitle, setTranslatedTitle] = useState(doc.title);
  const [translatedDescription, setTranslatedDescription] = useState(doc.description);
  const [translatedItems, setTranslatedItems] = useState<PortfolioItem[]>(doc.items);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Always show English without API call
      if (language === "eng") {
        if (!cancelled) {
          setTranslatedTitle(doc.title || t("portfolioTitle"));
          setTranslatedDescription(doc.description || t("portfolioSubtitle"));
          setTranslatedItems(doc.items);
        }
        return;
      }

      const [ttitle, tdesc] = await Promise.all([
        translateText(doc.title || t("portfolioTitle")),
        translateText(doc.description || t("portfolioSubtitle")),
      ]);

      // Translate only lightweight, safe fields per item (title, description, category).
      const items = await Promise.all(
        doc.items.map(async (it) => ({
          ...it,
          title: it.title ? await translateText(it.title) : it.title,
          description: it.description ? await translateText(it.description) : it.description,
          category: it.category ? await translateText(it.category) : it.category,
          // NOTE: we intentionally do not translate `text` because it may contain HTML and be long.
        }))
      );

      if (!cancelled) {
        setTranslatedTitle(ttitle);
        setTranslatedDescription(tdesc);
        setTranslatedItems(items);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, language]);

  /* ------------------------------ Categories (filter) ------------------------------ */
  const categoriesRaw = useMemo(() => {
    const set = new Set<string>();
    translatedItems.forEach((it) => it.category && set.add(it.category));
    return [ALL_VALUE, ...Array.from(set)];
  }, [translatedItems]);

  const [activeCategory, setActiveCategory] = useState<string>(ALL_VALUE);

  const filteredItems = useMemo(() => {
    if (activeCategory === ALL_VALUE) return translatedItems;
    return translatedItems.filter((it) => it.category === activeCategory);
  }, [translatedItems, activeCategory]);

  // Sliding / pagination (Prev / Next)
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const current = filteredItems.slice(start, start + PAGE_SIZE);

  // Reset page on category change and on data refresh
  useEffect(() => setPage(1), [activeCategory]);
  useEffect(() => setPage(1), [translatedItems]);

  // Modals
  const [videoOpen, setVideoOpen] = useState(false);
  const [readOpen, setReadOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  const openVideo = (it: PortfolioItem) => {
    if (!it.video) return;
    setActiveItem(it);
    setVideoOpen(true);
  };
  const openRead = (it: PortfolioItem) => {
    if (!it.text) return;
    setActiveItem(it);
    setReadOpen(true);
  };

  // Stats (static labels via t())
  const stats = [
    { value: "15M+", label: t("totalViews") },
    { value: "150+", label: t("portfolioProjectsCompleted") },
    { value: "25+", label: t("portfolioAwardsWon") },
    { value: "50+", label: t("happyClients") },
  ];

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-muted/40 to-muted/10 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {translatedTitle || t("portfolioTitle")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground flex items-start justify-center gap-2 mx-auto max-w-3xl">
              <Film className="h-5 w-5 mt-[2px] text-primary shrink-0" />
              <span>{translatedDescription || t("portfolioSubtitle")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Skeleton while fetching initial API (kept as-is) */}
      {isLoading ? (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-64 w-full bg-muted animate-pulse" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Stats */}
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Filter Tabs */}
          <section className="py-6 border-y bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categoriesRaw.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                  >
                    {cat === ALL_VALUE ? t("all") : cat}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* Cards (6 per slide) */}
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {isError ? (
                <div className="text-center text-sm text-muted-foreground">
                  Couldn’t load portfolio. Showing examples instead.
                </div>
              ) : null}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {current.map((it, idx) => {
                  const img =
                    it.image && String(it.image).trim()
                      ? String(it.image).startsWith("http")
                        ? String(it.image)
                        : `${process.env.NEXT_PUBLIC_API_IMAGE_URL || ""}${String(it.image).startsWith("/") ? "" : "/"
                        }${it.image}`
                      : PLACEHOLDER;

                  const hasVideo = Boolean(it.video && String(it.video).trim());
                  const hasText = Boolean(it.text && String(it.text).trim());
                  const year = it.date ? new Date(it.date).getFullYear() : "";

                  return (
                    <Card key={`${it.title}-${idx}`} className="group overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={it.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {(hasVideo || hasText) && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex gap-2">
                              {hasVideo && (
                                <Button size="sm" variant="secondary" onClick={() => openVideo(it)}>
                                  <Film className="h-4 w-4 mr-1" />
                                  {t("watch")}
                                </Button>
                              )}
                              {hasText && (
                                <Button size="sm" variant="outline" onClick={() => openRead(it)}>
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {t("read")}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        <Badge className="absolute top-4 left-4">{it.category}</Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {year || "—"}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold">{it.title}</h3>
                        <p className="text-muted-foreground mt-2 line-clamp-2">
                          {it.description}
                        </p>
                        {hasVideo && (
                          <div className="mt-3 flex items-center text-sm text-muted-foreground">
                            <Eye className="h-4 w-4 mr-1" />
                            {t("featuredVideo")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {filteredItems.length > PAGE_SIZE && (
                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="rounded-full"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="rounded-full"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyToCreate")}</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t("readyToCreateSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              {t("startYourProject")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              {t("contactUs")}
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* VIDEO MODAL */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5">
            <DialogTitle>{activeItem?.title}</DialogTitle>
            <DialogDescription className="sr-only">{t("watchProjectVideo")}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            {activeItem?.video ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  className="h-full w-full"
                  src={toEmbedUrl(activeItem.video)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeItem.title}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t("noVideoAvailable")}</div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button onClick={() => setVideoOpen(false)} variant="outline">
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* READ (TEXT) MODAL */}
      <Dialog open={readOpen} onOpenChange={setReadOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5">
            <DialogTitle>{activeItem?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {activeItem?.category} · {activeItem?.date ? new Date(activeItem.date).toDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 max-h-[65vh] overflow-y-auto">
            {activeItem?.text ? (
              <ArticleBody html={activeItem.text} />
            ) : (
              <div className="text-sm text-muted-foreground">{t("noTextAvailable")}</div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button onClick={() => setReadOpen(false)} variant="outline">
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------- helpers ---------------- */
function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function ArticleBody({ html }: { html: string }) {
  const isHTML = /<[^>]+>/.test(html);
  if (isHTML) {
    return (
      <div
        className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-headings:scroll-mt-20"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <p className="whitespace-pre-line leading-relaxed text-foreground/90">{html}</p>;
}
