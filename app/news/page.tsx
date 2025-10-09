// app/(admin)/news/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  User,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetNewsQuery } from "@/slices/newsApi";
import { useLanguage } from "@/components/language-provider";

/* =========================
   Fallback content
   ========================= */
const FALLBACK_ARTICLES = [
  {
    id: 1,
    title: "Asal Media Launches New Platform",
    description:
      "Discover the features of our new digital platform and how it empowers communities.",
    date: "2025-08-20",
    author: "News Desk",
    image: "",
    fullNews:
      "<p>We’re thrilled to unveil our new platform designed to amplify local voices and deliver reliable information. Expect faster load times, improved accessibility, and richer multimedia.</p>",
  },
  {
    id: 2,
    title: "Award for Excellence in Storytelling",
    description: "Asal Media Group wins the 2025 Excellence in Storytelling Award.",
    date: "2025-07-15",
    author: "Editorial Team",
    image: "",
    fullNews:
      "<p>Our commitment to human-centered stories has been recognized with a national award. Thank you to our audiences and partners for your continued support.</p>",
  },
  {
    id: 3,
    title: "Community Outreach Program Success",
    description: "Our latest outreach program has impacted thousands across the region.",
    date: "2025-06-10",
    author: "Programs Office",
    image: "",
    fullNews:
      "<p>Workshops, newsroom tours, and mentorships—our outreach reached more than 4,000 people this quarter. More initiatives launching soon.</p>",
  },
  {
    id: 4,
    title: "Nasiye App Reaches 100K Downloads",
    description: "Milestone achieved! Thank you for trusting Nasiye as your daily companion.",
    date: "2025-05-05",
    author: "Product Team",
    image: "",
    fullNews:
      "<p>Nasiye crossed 100K installs with strong retention. We’re shipping a refreshed home and offline mode next.</p>",
  },
  {
    id: 5,
    title: "Studio Upgrade Complete",
    description: "New gear and acoustics.",
    date: "2025-07-01",
    author: "Ops",
    image: "",
    fullNews: "<p>Better audio & video quality in every show.</p>",
  },
  {
    id: 6,
    title: "Partnership Announced",
    description: "New content syndication deal.",
    date: "2025-07-12",
    author: "Biz Dev",
    image: "",
    fullNews: "<p>Expect wider reach and fresh formats.</p>",
  },
  {
    id: 7,
    title: "Partnership Announced",
    description: "New content syndication deal.",
    date: "2025-07-12",
    author: "Biz Dev",
    image: "",
    fullNews: "<p>Expect wider reach and fresh formats.</p>",
  },
];

const IMG_BASE = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

function normalizeImage(src?: string | null): string | null {
  if (!src || !String(src).trim()) return null;
  return String(src).startsWith("http")
    ? String(src)
    : `${IMG_BASE}${String(src).startsWith("/") ? "" : "/"}${src}`;
}

function PlaceholderThumb({ label }: { label: string }) {
  return (
    <div className="relative h-48 w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="24" stroke="#e5e5e5" strokeWidth="2" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e5e5" strokeWidth="1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e5e5" strokeWidth="1" />
        <line x1="18" y1="18" x2="82" y2="82" stroke="#e5e5e5" strokeWidth="1" />
        <line x1="82" y1="18" x2="18" y2="82" stroke="#e5e5e5" strokeWidth="1" />
      </svg>
      <span className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow">
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </span>
      <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/90 text-white text-xs font-semibold shadow">
        {label}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div className="h-48 w-full bg-neutral-100 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" />
        <div className="h-5 w-3/4 bg-neutral-100 animate-pulse rounded" />
        <div className="h-4 w-full bg-neutral-100 animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-neutral-100 animate-pulse rounded" />
        <div className="flex justify-end">
          <div className="h-9 w-28 bg-neutral-100 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}

type CardItem = {
  id: string | number;
  title: string;
  date: string;
  author: string;
  description: string;
  image: string | null;
  fullNews: string;
};

const PAGE_SIZE = 6; // 2 rows x 3 cols

export default function NewsAdminPage() {
  const { t } = useLanguage();

  const { data, isLoading } = useGetNewsQuery({ page: 1, limit: 1, sort: "order" });

  const { pageTitle, pageDescription, cards } = useMemo(() => {
    const doc = data?.data?.[0];

    const useAPI =
      doc &&
      String(doc.status || "").toLowerCase() === "published" &&
      Array.isArray(doc.items) &&
      doc.items.length > 0;

    if (!useAPI) {
      return {
        pageTitle: t("newsPressTitle"),
        pageDescription: t("newsPressSubtitle"),
        cards: FALLBACK_ARTICLES.map<CardItem>((a) => ({
          id: a.id,
          title: a.title,
          author: a.author || t("newsDesk"),
          date: a.date,
          description: a.description,
          image: normalizeImage(a.image),
          fullNews: a.fullNews,
        })),
      };
    }

    const pt = doc.title || t("newsPressTitle");
    const pd = doc.description || t("newsPressSubtitle");

    const list = doc.items
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map<CardItem>((it, idx) => ({
        id: `${doc._id}-${idx}`,
        title: it.title || t("untitled"),
        author: it.author || t("newsDesk"),
        date: it.date ? String(it.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: it.description || "",
        image: normalizeImage(it.image || null),
        fullNews: it.fullNews || "",
      }));

    return { pageTitle: pt, pageDescription: pd, cards: list };
  }, [data, t]);

  // Modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CardItem | null>(null);
  const openModal = (item: CardItem) => {
    setActive(item);
    setOpen(true);
  };

  // Sliding (6 per view)
  const [slide, setSlide] = useState(0);
  const slides = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));

  const visibleGroups = useMemo(() => {
    const out: CardItem[][] = [];
    for (let i = 0; i < cards.length; i += PAGE_SIZE) {
      out.push(cards.slice(i, i + PAGE_SIZE));
    }
    if (out.length === 0) out.push([]);
    return out;
  }, [cards]);

  const prev = () => setSlide((s) => (s - 1 + slides) % slides);
  const next = () => setSlide((s) => (s + 1) % slides);

  const newsLabel = t("News"); // badge on placeholder
  const readMoreLabel = t("readMoreArrow"); // "Read more →"

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <section className="py-14 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Page Title + Description */}
            <div className="mx-auto mb-8 md:mb-10 max-w-3xl text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{pageTitle}</h1>
              <p className="mt-3 text-neutral-600">{pageDescription}</p>
            </div>

            {/* Loading skeletons */}
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Slider */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${slide * 100}%)` }}
                  >
                    {visibleGroups.map((group, idx) => (
                      <div key={idx} className="w-full shrink-0">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {group.map((item) => {
                            const img = item.image;
                            return (
                              <article
                                key={item.id}
                                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                                onClick={() => openModal(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && openModal(item)}
                              >
                                {img ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={img} alt={item.title} className="h-48 w-full object-cover" />
                                ) : (
                                  <PlaceholderThumb label={newsLabel} />
                                )}

                                <div className="p-6 flex flex-col gap-3 flex-1">
                                  <h2
                                    className="text-lg font-semibold leading-snug hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModal(item);
                                    }}
                                  >
                                    {item.title}
                                  </h2>

                                  {/* Meta */}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
                                    <span className="inline-flex items-center gap-1.5">
                                      <User className="h-4 w-4 text-neutral-500" />
                                      {item.author}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4 text-neutral-500" />
                                      {item.date}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  {item.description ? (
                                    <p className="text-sm text-neutral-700 mt-1 line-clamp-3">
                                      {item.description}
                                    </p>
                                  ) : null}

                                  {/* Read more (bottom-right) */}
                                  <div className="mt-auto pt-3 flex justify-end">
                                    <Button
                                      variant="outline"
                                      className="rounded-full h-9 px-4"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(item);
                                      }}
                                    >
                                      {readMoreLabel}
                                    </Button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}

                          {/* pad last slide to keep grid consistent on lg */}
                          {group.length < PAGE_SIZE &&
                            Array.from({ length: PAGE_SIZE - group.length }).map((_, i) => (
                              <div key={`pad-${i}`} className="hidden lg:block" />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                {cards.length > PAGE_SIZE && (
                  <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={prev} className="gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      {t("prev")}
                    </Button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: slides }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSlide(i)}
                          className={`h-2.5 w-2.5 rounded-full transition ${i === slide ? "bg-neutral-900" : "bg-neutral-300 hover:bg-neutral-400"
                            }`}
                          aria-label={`${t("goToSlide")} ${i + 1}`}
                        />
                      ))}
                    </div>

                    <Button variant="outline" onClick={next} className="gap-2">
                      {t("next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Static Subscribe section (always last before Footer) */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("stayUpdated")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("adminNewsNewsletterSubtitle")}
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <input
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-md px-3 py-2 bg-primary-foreground text-primary placeholder:text-primary/60"
              />
              <Button variant="secondary">{t("subscribe")}</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal (scrollable) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          <DialogHeader className="sticky top-0 z-10 px-5 py-4 border-b bg-white/95 backdrop-blur">
            <DialogTitle className="text-base md:text-lg font-semibold pr-10">
              {active?.title || t("News")}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          {active && (
            <>
              {/* Meta */}
              <div className="px-5 pt-4 text-sm text-neutral-600 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4 text-neutral-500" />
                  {active.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  {active.date}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 pb-6 pt-3">
                {active.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full max-h-[360px] object-cover rounded-md mb-4"
                  />
                ) : null}

                {active.fullNews ? (
                  <article
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: active.fullNews }}
                  />
                ) : (
                  <p className="text-neutral-700">{t("noAdditionalDetails")}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
