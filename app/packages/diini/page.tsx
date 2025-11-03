"use client";

import React from "react";
import { useLanguage } from "@/components/language-provider";
import { useTranslatedText } from "@/hooks/use-translated-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPackagesQuery } from "@/slices/packageApi";
import { resolveImageUrl } from "@/lib/utils";

/* ------------------------------- Types ------------------------------- */
type DbStory = {
  image: string | null;
  title: string;
  description: string;
  author: string;
  date: string;
  fullVersion: string;
  category?: string;
};

type DbItem = {
  _id: string;
  title: string;
  description: string;
  slug: string;
  status: "draft" | "published";
  category?: string;
  featuredStories?: DbStory[];
};

/* ------------------------------ Constants ---------------------------- */
const PLACEHOLDER = "/placeholder.svg";

/* ---- Static fallback ---- */
const fallbackFeatured = {
  id: "0",
  title: "Ramadan Programs Unite Somali Communities",
  excerpt:
    "Special Ramadan broadcasts share Islamic teachings, Somali traditions, and community stories across the region.",
  image: PLACEHOLDER,
  category: "Ramadan",
  author: "Sheikh Abdirahman",
  date: "2024-03-15",
  readTime: "5 min read",
  fullVersion:
    "Full story content is unavailable in fallback mode. Replace with real content once published.",
};

const fallbackArticles = [
  {
    id: "2",
    title: "Quran Recitation Competition Inspires Youth",
    excerpt:
      "Young Somalis participate in national Quran recitation contests, promoting Islamic values and education.",
    image: PLACEHOLDER,
    category: "Quran",
    author: "Ustad Ahmed",
    date: "2024-03-10",
    readTime: "3 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "3",
    title: "Islamic Scholars Discuss Community Issues",
    excerpt:
      "Weekly panel features Somali scholars addressing faith, family, and social challenges.",
    image: PLACEHOLDER,
    category: "Scholars",
    author: "Sheikh Mohamed",
    date: "2024-03-08",
    readTime: "4 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "4",
    title: "Mosques Lead Charity Initiatives During Ramadan",
    excerpt: "Local mosques organize food drives and support for families in need.",
    image: PLACEHOLDER,
    category: "Charity",
    author: "Fatima Omar",
    date: "2024-03-05",
    readTime: "6 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "5",
    title: "Islamic Education Expands in Somali Schools",
    excerpt:
      "New curriculum strengthens Islamic studies and Somali cultural heritage in schools.",
    image: PLACEHOLDER,
    category: "Education",
    author: "Ahmed Ali",
    date: "2024-03-01",
    readTime: "3 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "6",
    title: "Community Iftar Events Foster Unity",
    excerpt:
      "Somali families and neighbors gather for iftar meals, strengthening bonds and faith.",
    image: PLACEHOLDER,
    category: "Iftar",
    author: "Khadija Mohamud",
    date: "2024-02-28",
    readTime: "4 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "7",
    title: "Islamic Radio Programs Reach Rural Areas",
    excerpt:
      "Broadcasts share Islamic teachings and Somali stories with remote communities.",
    image: PLACEHOLDER,
    category: "Radio",
    author: "Omar Farah",
    date: "2024-02-25",
    readTime: "5 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
];

/* ------------------------------ Helpers ------------------------------ */
const minutesFromText = (text: string) => {
  const words = text?.trim()?.split(/\s+/).length || 0;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};


function normalizeStories(item: DbItem | null | undefined) {
  if (
    !item ||
    item.slug !== "religious" ||
    item.status !== "published" ||
    !Array.isArray(item.featuredStories) ||
    item.featuredStories.length === 0
  ) {
    const list = [fallbackFeatured, ...fallbackArticles];
    return {
      description:
        "Discover Islamic Somali programs, teachings, and community stories",
      stories: list,
    };
  }
  const stories = item.featuredStories.map((s, idx) => ({
    id: String(idx),
    title: (s.title || "").replaceAll('"', "").trim() || "Untitled",
    excerpt: (s.description || "").replaceAll('"', "").trim() || "",
      image: resolveImageUrl(s.image, PLACEHOLDER),
    category: s.category || "Religious",
    author: s.author || "Unknown",
    date: s.date || new Date().toISOString(),
    readTime: minutesFromText(s.fullVersion),
    fullVersion: s.fullVersion || "",
  }));
  return {
    description:
      (item.description || "").replaceAll('"', "") ||
      "Discover Islamic Somali programs, teachings, and community stories",
    stories,
  };
}

function chunkInto<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ------------------------------ Modal ------------------------------ */
function SimpleModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

/* ----------------------- Cards (avoid hooks-in-loop) ---------------------- */
function FeaturedStory({
  story,
  onOpen,
}: {
  story: any;
  onOpen: (title: string, content: string) => void;
}) {
  const { t } = useLanguage();
  const title = useTranslatedText(story?.title);
  const excerpt = useTranslatedText(story?.excerpt);
  const category = useTranslatedText(story?.category);
  const author = useTranslatedText(story?.author);
  const readTime = useTranslatedText(story?.readTime);
  const content = useTranslatedText(story?.fullVersion);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t("featuredStory")}</h2>
        </div>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="md:flex">
            <div className="md:w-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(story.image, PLACEHOLDER)}
                alt={title || "Featured"}
                className="w-full h-64 md:h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <Badge className="mb-4 bg-secondary">{category}</Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
                {title}
              </h3>
              <p className="text-muted-foreground mb-6 text-pretty">{excerpt}</p>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(story.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {readTime}
                  </div>
                </div>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => onOpen(title || "", content || "")}
              >
                {t("readFullStory")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function ArticleCard({
  article,
  onOpen,
}: {
  article: any;
  onOpen: (title: string, content: string) => void;
}) {
  const { t } = useLanguage();
  const title = useTranslatedText(article?.title);
  const excerpt = useTranslatedText(article?.excerpt);
  const category = useTranslatedText(article?.category);
  const author = useTranslatedText(article?.author);
  const readTime = useTranslatedText(article?.readTime);
  const content = useTranslatedText(article?.fullVersion);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveImageUrl(article.image, PLACEHOLDER)}
          alt={title || "Story"}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <Badge className="absolute top-3 left-3 bg-primary">{category}</Badge>
      </div>
      <CardHeader>
        <h3 className="text-lg font-semibold line-clamp-2 text-balance">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3 text-pretty">{excerpt}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {author}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {readTime}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(article.date).toLocaleDateString()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpen(title || "", content || "")}
          >
            {t("readMore")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------- Skeletons ------------------------------- */
const HeroSkeleton = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-4xl mx-auto text-center">
        <Skeleton className="h-10 md:h-16 w-64 mx-auto mb-6 bg-muted" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto mb-2 bg-muted" />
      </div>
    </div>
  </section>
);

const FeaturedSkeleton = () => (
  <section className="py-16 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-6 w-40 mb-4 bg-muted" />
      <Card className="overflow-hidden">
        <div className="md:flex">
          <Skeleton className="md:w-1/2 h-64 md:h-[320px] bg-muted" />
          <div className="md:w-1/2 p-8 space-y-4">
            <Skeleton className="h-5 w-24 bg-muted" />
            <Skeleton className="h-8 w-3/4 bg-muted" />
            <Skeleton className="h-16 w-full bg-muted" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-4 w-24 bg-muted" />
            </div>
            <Skeleton className="h-10 w-40 bg-muted" />
          </div>
        </div>
      </Card>
    </div>
  </section>
);

const GridSkeleton = () => (
  <section className="py-12 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 w-full bg-muted" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-2/3 bg-muted" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* --------------------------------- Page --------------------------------- */
export default function DiiniPage() {
  const { t } = useLanguage();

  // data
  const { data, isLoading, isError } = useGetPackagesQuery({ slug: "religious" });
  const item: DbItem | null = data?.data?.find((d: DbItem) => d.slug === "religious") ?? null;
  const { description, stories } = normalizeStories(isError ? null : item);

  // featured + list
  const featured = { ...stories[0], image: resolveImageUrl(stories[0]?.image, PLACEHOLDER) };
  const list = stories.map((s) => ({ ...s, image: resolveImageUrl(s.image, PLACEHOLDER) }));

  // modal
  const [openModal, setOpenModal] = React.useState({ open: false, title: "", content: "" });
  const openReader = (title: string, content: string) =>
    setOpenModal({ open: true, title, content });

  // CATEGORY FILTER (derived from data)
  const derivedCategories = React.useMemo(() => {
    const set = new Set<string>();
    list.forEach((s) => s.category && set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [list]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const filteredList = React.useMemo(
    () => (selectedCategory === "All" ? list : list.filter((s) => s.category === selectedCategory)),
    [list, selectedCategory]
  );

  // slider (4 per slide)
  const pageSize = 4;
  const slides = React.useMemo(() => chunkInto(filteredList, pageSize), [filteredList]);
  const totalPages = Math.max(1, slides.length);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [selectedCategory]);
  React.useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [totalPages, page]);

  const toPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const toNext = () => setPage((p) => (p + 1) % totalPages);

  // translated page heading + description
  const heading = useTranslatedText(t("Diini"));
  const descriptionT = useTranslatedText(description);

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero */}
        {isLoading ? (
          <HeroSkeleton />
        ) : (
          <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  {heading}
                </h1>
                <p className="text-xl text-muted-foreground text-pretty">{descriptionT}</p>
              </div>
            </div>
          </section>
        )}

        {/* Featured */}
        {isLoading ? (
          <FeaturedSkeleton />
        ) : (
          <FeaturedStory story={featured} onOpen={openReader} />
        )}

        {/* CATEGORY FILTER */}
        {!isLoading && (
          <section className="pt-6 pb-2 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {derivedCategories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <Button
                      key={cat}
                      variant={active ? "default" : "outline"}
                      className={active ? "bg-primary text-white hover:bg-primary/90" : ""}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Cards Slider */}
        {isLoading ? (
          <GridSkeleton />
        ) : (
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-semibold mb-4">{t("latestStories")}</h2>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    width: `${totalPages * 100}%`,
                    transform: `translateX(-${page * (100 / totalPages)}%)`,
                  }}
                >
                  {slides.map((slideItems, idx) => (
                    <div
                      key={idx}
                      className="w-full shrink-0 px-0"
                      style={{ width: `${100 / totalPages}%` }}
                    >
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {slideItems.map((article) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            onOpen={openReader}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Prev/Next controls */}
        {!isLoading && (
          <section className="pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={toPrev}>
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  {t("prev")}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {t("pageOf")
                    .replace("{page}", String(page + 1))
                    .replace("{total}", String(totalPages))}
                </div>
                <Button variant="outline" onClick={toNext}>
                  {t("next")}
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Stay Updated */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("stayUpdated")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("newsletterSubtitle")}
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
      </div>

      {/* Modal */}
      <SimpleModal
        open={openModal.open}
        title={openModal.title}
        onClose={() => setOpenModal((s) => ({ ...s, open: false }))}
      >
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert whitespace-pre-wrap">
          {openModal.content}
        </div>
      </SimpleModal>

      <Footer />
    </>
  );
}
