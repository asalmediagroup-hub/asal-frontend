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

/* ------------------------------- Types -------------------------------- */
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

/* ------------------------ Constants / Fallbacks ------------------------ */
const PLACEHOLDER = "/placeholder.svg";
const ALL = "__ALL__";

const featuredNews = {
  id: "1",
  title: "Asal Media Group Launches Revolutionary Nasiye Platform Across 15 Countries",
  excerpt:
    "The new streaming platform brings authentic Somali and East African content to global audiences with innovative features and local language support.",
  image: null as string | null,
  category: "Platform Launch",
  author: "Editorial Team",
  date: "2024-03-15",
  readTime: "5 min read",
  fullVersion:
    "Full story content is unavailable in fallback mode. Replace with real content once published.",
};

const newsArticles = [
  {
    id: "2",
    title: "Jiil Media Wins Digital Innovation Award at East Africa Media Summit",
    excerpt:
      "Recognition for outstanding digital content creation and youth engagement across social media platforms.",
    image: null as string | null,
    category: "Awards",
    author: "Sarah Ahmed",
    date: "2024-03-10",
    readTime: "3 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "3",
    title: "Masrax Production Completes Major Documentary on Somali Heritage",
    excerpt:
      "12-part documentary series explores cultural traditions and modern diaspora communities worldwide.",
    image: null as string | null,
    category: "Production",
    author: "Mohamed Hassan",
    date: "2024-03-08",
    readTime: "4 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "4",
    title: "Asal TV Expands Broadcasting to North America and Europe",
    excerpt:
      "New satellite partnerships enable 24/7 broadcasting to Somali communities in diaspora regions.",
    image: null as string | null,
    category: "Expansion",
    author: "Fatima Omar",
    date: "2024-03-05",
    readTime: "6 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "5",
    title: "Youth Voices Podcast Network Reaches 2 Million Monthly Listeners",
    excerpt:
      "Milestone achievement for digital platform focusing on young East African entrepreneurs and innovators.",
    image: null as string | null,
    category: "Digital",
    author: "Ahmed Ali",
    date: "2024-03-01",
    readTime: "3 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "6",
    title: "Asal Media Group Partners with International Film Festival",
    excerpt:
      "Strategic partnership brings East African cinema to global audiences through prestigious film festival collaboration.",
    image: null as string | null,
    category: "Partnership",
    author: "Khadija Mohamud",
    date: "2024-02-28",
    readTime: "4 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
  {
    id: "7",
    title: "New Studio Complex Opens in Mogadishu with State-of-Art Equipment",
    excerpt:
      "Modern production facility enhances content creation capabilities with latest broadcasting technology.",
    image: null as string | null,
    category: "Infrastructure",
    author: "Omar Farah",
    date: "2024-02-25",
    readTime: "5 min read",
    fullVersion: "Full story content is unavailable in fallback mode.",
  },
];

/* -------------------------------- Helpers ------------------------------ */
const minutesFromText = (text: string) => {
  const words = text?.trim()?.split(/\s+/).length || 0;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};


function normalizeStories(item: DbItem | null | undefined) {
  if (
    item &&
    item.slug === "news" &&
    item.status === "published" &&
    Array.isArray(item.featuredStories) &&
    item.featuredStories.length > 0
  ) {
    const stories = item.featuredStories.map((s, idx) => ({
      id: String(idx),
      title: (s.title || "").replaceAll('"', "").trim() || "Untitled",
      excerpt: (s.description || "").replaceAll('"', "").trim() || "",
      image: resolveImageUrl(s.image, PLACEHOLDER),
      category: s.category || "News",
      author: s.author || "Unknown",
      date: s.date || new Date().toISOString(),
      readTime: minutesFromText(s.fullVersion),
      fullVersion: s.fullVersion || "",
    }));
    return {
      description:
        (item.description || "").replaceAll('"', "") ||
        "Stay updated with the latest news and developments from Asal Media Group",
      stories,
    };
  }

  // Fallback (featured + list)
  const list = [
    {
      id: featuredNews.id,
      title: featuredNews.title,
      excerpt: featuredNews.excerpt,
      image: resolveImageUrl(featuredNews.image, PLACEHOLDER),
      category: featuredNews.category,
      author: featuredNews.author,
      date: featuredNews.date,
      readTime: featuredNews.readTime,
      fullVersion: featuredNews.fullVersion,
    },
    ...newsArticles.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      image: resolveImageUrl(a.image, PLACEHOLDER),
      category: a.category,
      author: a.author,
      date: a.date,
      readTime: a.readTime,
      fullVersion: a.fullVersion,
    })),
  ];

  return {
    description: "Stay updated with the latest news and developments from Asal Media Group",
    stories: list,
  };
}

function chunkInto<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* -------------------------------- Modal -------------------------------- */
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

/* -------------------- Featured + Article cards (translated) -------------------- */
function FeaturedBlock({
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
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-balance">{title}</h3>
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
              <Button className="bg-primary hover:bg-primary/90" onClick={() => onOpen(title || "", content || "")}>
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
          <Button variant="ghost" size="sm" onClick={() => onOpen(title || "", content || "")}>
            {t("readMore")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------- Category Chip ----------------------------- */
function CategoryChip({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const labelAll = t("all");
  const labelValue = useTranslatedText(value);
  const label = value === ALL ? labelAll : labelValue;

  return (
    <Button
      variant={active ? "default" : "outline"}
      className={active ? "bg-primary text-white hover:bg-primary/90" : ""}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function NewsPage() {
  const { t } = useLanguage();

  // DB fetch
  const { data, isLoading, isError } = useGetPackagesQuery({ slug: "news" });
  const item: DbItem | null = data?.data?.find((d: DbItem) => d.slug === "news") ?? null;

  const { description, stories } = normalizeStories(isError ? null : item);

  const featured = { ...stories[0], image: resolveImageUrl(stories[0]?.image as string, PLACEHOLDER) };
  const list = stories.map((s) => ({ ...s, image: resolveImageUrl(s.image as string, PLACEHOLDER) }));

  // Modal
  const [openModal, setOpenModal] = React.useState({ open: false, title: "", content: "" });

  // Categories (raw values for filtering; translated labels in UI)
  const derivedCategories = React.useMemo(() => {
    const set = new Set<string>();
    list.forEach((s: any) => s.category && set.add(s.category));
    return [ALL, ...Array.from(set)];
  }, [list]);

  const [selectedCategory, setSelectedCategory] = React.useState<string>(ALL);

  const filteredList = React.useMemo(
    () => (selectedCategory === ALL ? list : list.filter((s: any) => s.category === selectedCategory)),
    [list, selectedCategory]
  );

  // Slider
  const pageSize = 4;
  const slides = React.useMemo(() => chunkInto(filteredList, pageSize), [filteredList]);
  const totalPages = Math.max(1, slides.length);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => setPage(0), [selectedCategory]);
  React.useEffect(() => {
    if (page > totalPages - 1) setPage(0);
  }, [totalPages, page]);

  const toPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const toNext = () => setPage((p) => (p + 1) % totalPages);

  /* ----------------------------- Skeletons ----------------------------- */
  const HeroSkeleton = () => (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

  // Translated hero description (dynamic)
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
                  {t("News")}
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
          <FeaturedBlock
            story={featured}
            onOpen={(title, content) => setOpenModal({ open: true, title, content })}
          />
        )}

        {/* Category Filter (values stable, labels translated) */}
        {!isLoading && (
          <section className="pt-6 pb-2 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {derivedCategories.map((value) => (
                  <CategoryChip
                    key={value}
                    value={value}
                    active={selectedCategory === value}
                    onClick={() => setSelectedCategory(value)}
                  />
                ))}
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
                        {slideItems.map((article: any) => (
                          <ArticleCard
                            key={article.id}
                            article={article}
                            onOpen={(title, content) =>
                              setOpenModal({ open: true, title, content })
                            }
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

        {/* Prev/Next */}
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

        {/* Newsletter */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("stayUpdated")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("newsNewsletterSubtitle")}
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
