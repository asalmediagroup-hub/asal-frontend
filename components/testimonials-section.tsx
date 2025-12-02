"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useGetPartnersReviewsQuery } from "@/slices/partnersReviewApi";
import { useLanguage } from "@/components/language-provider";
import { resolveImageUrl } from "@/lib/utils";

/* ------------------------ Static fallback list ------------------------ */
const FALLBACK_TITLE = "What Our Partners Say";
const FALLBACK_DESC =
  "Don't just take our word for it. Here's what industry leaders and content creators say about working with Asal Media Group.";

const FALLBACK_TESTIMONIALS = [
  {
    name: "Ahmed Hassan",
    roleCompany: "CEO, Digital Marketing Agency • MediaTech Solutions",
    content:
      "Asal Media Group transformed our brand's digital presence. Their expertise in content creation and distribution helped us reach audiences we never thought possible.",
    rating: 5,
    avatar: "/middle-eastern-man-headshot.png",
  },
  {
    name: "Fatima Al-Zahra",
    roleCompany: "Marketing Director • Regional Bank",
    content:
      "Working with Masrax Production was exceptional. They delivered high-quality content that perfectly captured our brand message and resonated with our target audience.",
    rating: 5,
    avatar: "/professional-headshot-middle-eastern-woman.png",
  },
  {
    name: "Omar Abdullahi",
    roleCompany: "Content Creator • Independent Producer",
    content:
      "The Nasiye platform has revolutionized how I distribute my content. The reach and engagement I get through their platform is unmatched in the region.",
    rating: 5,
    avatar: "/professional-headshot-african-man.png",
  },
  {
    name: "Asal TV",
    roleCompany: "CEO, Digital Marketing Agency MediaTech Solutions",
    content:
      "Asal Media Group transformed our brand's digital presence. Their expertise in content creation and distribution helped us reach audiences we never thought possible.",
    rating: 5,
    avatar: "/placeholder.svg",
  },
];

const PLACEHOLDER = "/placeholder.svg";

/* ------------------------------ Helpers ------------------------------ */
function clampStars(n: any) {
  const num = Number(n);
  if (!Number.isFinite(num)) return 5;
  return Math.max(0, Math.min(5, Math.round(num)));
}


/* ---------------------------- API → UI map ---------------------------- */
type ApiItem = {
  image?: string | null;
  title?: string;
  message?: string;
  authorName?: string;
  starsNo?: number;
};
type ApiGroup = {
  status?: string;
  title?: string;
  description?: string;
  items?: ApiItem[];
};

function mapApiToTestimonials(payload: any) {
  const groups: ApiGroup[] = Array.isArray(payload?.data) ? payload.data : [];
  const published = groups.filter((g) => g?.status === "published");
  if (published.length === 0) {
    return {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESC,
      items: [] as any[],
    };
  }

  const header = published[0];
  const title = header?.title?.trim() || FALLBACK_TITLE;
  const description = header?.description?.trim() || FALLBACK_DESC;

  const items = published.flatMap((g) => (Array.isArray(g.items) ? g.items : []));
  const cards = items.map((it) => ({
    name: it?.authorName?.trim() || "Anonymous",
    roleCompany: (it?.title || "").trim(),
    content: (it?.message || "").trim(),
    rating: clampStars(it?.starsNo),
    avatar: resolveImageUrl(it?.image, PLACEHOLDER),
  }));

  return { title, description, items: cards };
}

/* -------------------------- Responsive helpers -------------------------- */
function useWindowedCount() {
  const [count, setCount] = React.useState(1);
  React.useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCount(3);
      else if (w >= 768) setCount(2);
      else setCount(1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return count;
}

/* ---------------------------- Stars component --------------------------- */
function StarRow({ rating }: { rating: number }) {
  const active = clampStars(rating);
  return (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={
            i < active
              ? "h-4 w-4 fill-secondary text-secondary"
              : "h-4 w-4 text-muted-foreground"
          }
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.168L12 18.896l-7.336 3.868 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" />
        </svg>
      ))}
    </div>
  );
}

/* ------------------------- Translation utilities ------------------------- */
const translateCache = new Map<string, string>();
async function trDynamic(
  text: string,
  translateText: (txt: string) => Promise<string>,
  langKey: string
): Promise<string> {
  const key = `${langKey}::${text}`;
  if (translateCache.has(key)) return translateCache.get(key)!;
  try {
    const out = await translateText(text);
    translateCache.set(key, out);
    return out;
  } catch {
    return text;
  }
}

/* ----------------------- Motion / Animation helpers ---------------------- */
function throwInVariants(index: number) {
  const rot = (index % 2 ? -1 : 1) * (index % 3 === 0 ? 6 : 4); // initial tilt
  const xJitter = (index % 3) * (index % 2 ? -6 : 6);           // slight horizontal offset

  return {
    hidden: {
      opacity: 0,
      y: -72,
      x: xJitter,
      rotate: rot,
      scale: 0.96,
      filter: "blur(6px)",
    },
    visible: {
      opacity: [0, 1, 1],
      y: [-72, 8, 0],            // overshoot then settle
      x: [xJitter, xJitter * 0.2, 0],
      rotate: [rot, rot * 0.25, 0],
      scale: [0.96, 1.005, 1],
      filter: ["blur(6px)", "blur(1px)", "blur(0px)"],
      transition: {
        duration: 1,             // ← 4 seconds
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.85, 1],     // most motion early, gentle settle at the end
      },
    },
  };
}

const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/* ------------------------------ Component ------------------------------ */
export function TestimonialsSection() {
  const { data, isLoading, isError } = useGetPartnersReviewsQuery();
  const { t, translateText, isRTL, language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const isArabic = language === "ar";
  const quoteStart = isArabic ? "«" : "“";
  const quoteEnd = isArabic ? "»" : "”";

  // map + choose API/fallback
  const mapped = React.useMemo(() => mapApiToTestimonials(data), [data]);
  const hasDynamic = mapped.items && mapped.items.length > 0;

  const fallbackTitle = t?.("testimonialsTile") || FALLBACK_TITLE;
  const fallbackDesc = t?.("testimonialsSubtitle") || FALLBACK_DESC;

  const baseTitle = hasDynamic ? mapped.title : fallbackTitle;
  const baseDesc = hasDynamic ? mapped.description : fallbackDesc;
  const baseCards = hasDynamic ? mapped.items : FALLBACK_TESTIMONIALS;

  const [title, setTitle] = React.useState(baseTitle);
  const [description, setDescription] = React.useState(baseDesc);
  const [cards, setCards] = React.useState(baseCards);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      const [tt, dd] = await Promise.all([
        trDynamic(baseTitle, translateText, String(language)),
        trDynamic(baseDesc, translateText, String(language)),
      ]);

      const translatedCards = await Promise.all(
        baseCards.map(async (c) => {
          const nameSrc = c.name || t?.("anonymous") || "Anonymous";
          const roleSrc = c.roleCompany || "";
          const contSrc = c.content || "";

          const [name, roleCompany, content] = await Promise.all([
            trDynamic(nameSrc, translateText, String(language)),
            trDynamic(roleSrc, translateText, String(language)),
            trDynamic(contSrc, translateText, String(language)),
          ]);

          return { ...c, name, roleCompany, content };
        })
      );

      if (!cancelled) {
        setTitle(tt);
        setDescription(dd);
        setCards(translatedCards);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTitle, baseDesc, baseCards, translateText, language]);

  // slider
  const windowSize = useWindowedCount();
  const total = cards.length;
  const [start, setStart] = React.useState(0);
  React.useEffect(() => setStart(0), [total, windowSize]);

  const canSlide = total > windowSize;
  const next = () => canSlide && setStart((s) => (s + 1) % total);
  const prev = () => canSlide && setStart((s) => (s - 1 + total) % total);

  const cardWidthPercent = 100 / Math.max(1, windowSize);
  const translatePercent = -(start * cardWidthPercent);

  const trackCards = React.useMemo(() => {
    if (total === 0) return [];
    const clones = cards.slice(0, Math.min(windowSize, total));
    return [...cards, ...clones];
  }, [cards, total, windowSize]);

  const dir = isRTL ? "rtl" : "ltr";
  const align = isRTL ? "text-right" : "text-left";

  // Hover transform shared
  const hoverTransform = prefersReducedMotion
    ? {}
    : { y: -6, rotate: 0.4, scale: 1.01 };

  return (
    <section className="py-24 bg-muted/30" dir={dir}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#B5040F]">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden border border-border/50 rounded-2xl p-0 h-full">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !canSlide ? (
          /* Grid (no slider) with throw-in & hover */
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={listStagger}
          >
            {cards.map((t, i) => (
              <motion.div
                key={`${t.name}-${i}`}
                className="relative"
                variants={throwInVariants(i)}
                whileHover={hoverTransform}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                {/* Glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                     style={{ boxShadow: "0 0 0 2px rgba(181,4,15,0.08), 0 18px 40px rgba(0,0,0,0.06)" }} />
                <Card className="relative overflow-hidden border border-border/50 rounded-2xl p-0 h-full">
                  <CardContent className={`p-6 md:p-8 space-y-6 h-full ${align}`}>
                    {/* Decorative quotes */}
                    <div className={`absolute top-6 ${isRTL ? "left-6" : "right-6"} text-secondary/20`}>
                      <Quote className="h-8 w-8" />
                    </div>
                    <div className={`absolute bottom-6 ${isRTL ? "right-6" : "left-6"} text-secondary/10 rotate-180`}>
                      <Quote className="h-8 w-8" />
                    </div>

                    <StarRow rating={t.rating ?? 5} />
                    <p className="text-card-foreground leading-relaxed italic">
                      {isArabic ? "«" : "“"}
                      {t.content}
                      {isArabic ? "»" : "”"}
                    </p>
                    <div className={`flex items-center ${isRTL ? "space-x-reverse" : ""} space-x-4 pt-4 border-t border-border/50`}>
                      <img
                        src={t.avatar || PLACEHOLDER}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                        }}
                      />
                      <div className={`${align}`}>
                        <div className="font-semibold text-card-foreground">{t.name}</div>
                        {t.roleCompany && (
                          <div className="text-sm text-muted-foreground">{t.roleCompany}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Slider: each visible card still throws in & hovers */
          <motion.div
            className="overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            variants={listStagger}
          >
            <div
              className={`flex transition-transform duration-500 ease-in-out will-change-transform -mx-4 ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ transform: `translateX(${translatePercent}%)` }}
            >
              {trackCards.map((t, i) => (
                <motion.div
                  key={`${t.name}-${i}`}
                  className="px-4"
                  style={{
                    flex: `0 0 ${cardWidthPercent}%`,
                    maxWidth: `${cardWidthPercent}%`,
                  }}
                  variants={throwInVariants(i)}
                  whileHover={hoverTransform}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {/* Glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                       style={{ boxShadow: "0 0 0 2px rgba(181,4,15,0.08), 0 18px 40px rgba(0,0,0,0.06)" }} />
                  <Card className="relative overflow-hidden border border-border/50 rounded-2xl p-0 h-full">
                    <CardContent className={`p-6 md:p-8 space-y-6 h-full ${align}`}>
                      {/* Decorative quotes */}
                      <div className={`absolute top-6 ${isRTL ? "left-6" : "right-6"} text-secondary/20`}>
                        <Quote className="h-8 w-8" />
                      </div>
                      <div className={`absolute bottom-6 ${isRTL ? "right-6" : "left-6"} text-secondary/10 rotate-180`}>
                        <Quote className="h-8 w-8" />
                      </div>

                      <StarRow rating={t.rating ?? 5} />
                      <p className="text-card-foreground leading-relaxed italic">
                        {isArabic ? "«" : "“"}
                        {t.content}
                        {isArabic ? "»" : "”"}
                      </p>
                      <div className={`flex items-center ${isRTL ? "space-x-reverse" : ""} space-x-4 pt-4 border-t border-border/50`}>
                        <img
                          src={t.avatar || PLACEHOLDER}
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                          }}
                        />
                        <div className={`${align}`}>
                          <div className="font-semibold text-card-foreground">{t.name}</div>
                          {t.roleCompany && (
                            <div className="text-sm text-muted-foreground">{t.roleCompany}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Prev / Next */}
        {!isLoading && canSlide && (
          <div className={`mt-8 flex items-center justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button variant="outline" size="icon" onClick={prev} aria-label={t?.("prev") || "Prev"} className="text-secondary hover:text-primary">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={next} aria-label={t?.("next") || "Next"} className="text-secondary hover:text-primary">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Fallback message */}
        {!isLoading && isError && (
          <p className="mt-6 text-sm text-muted-foreground text-center">
            {t?.("loadingFallback") || "Showing recent partner quotes while we load the latest reviews."}
          </p>
        )}
      </div>
    </section>
  );
}
