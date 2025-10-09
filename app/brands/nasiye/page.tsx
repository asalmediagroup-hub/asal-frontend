// app/(site)/nasiye/page.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, Star, ArrowRight } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useGetBrandsQuery } from "@/slices/brandApi";

// ✅ translation imports
import { useLanguage } from "@/components/language-provider";
import { useTranslatedText } from "@/hooks/use-translated-content";

/* ------------------------------ Static data ------------------------------ */
const featuresStatic = [
    {
        title: "Live TV Streaming",
        description: "Watch Asal TV and other channels live on your mobile device",
        image: "/television-studio-broadcasting-modern.png",
    },
    {
        title: "On-Demand Content",
        description: "Access thousands of shows, movies, and documentaries anytime",
        image: "/film-production-studio-equipment.png",
    },
    {
        title: "Exclusive Originals",
        description: "Enjoy premium content created exclusively for Nasiye platform",
        image: "/somali-drama-series-modern-production-streaming.png",
    },
    {
        title: "Podcast Library",
        description: "Listen to Jiil Media podcasts and other audio content",
        image: "/youth-podcast-studio-modern-recording-setup.png",
    },
];

const categoriesStatic = [
    { name: "News & Current Affairs", count: "500+ episodes" },
    { name: "Entertainment Shows", count: "200+ series" },
    { name: "Documentaries", count: "150+ films" },
    { name: "Cultural Programs", count: "300+ episodes" },
    { name: "Youth Content", count: "400+ videos" },
    { name: "Business & Finance", count: "100+ episodes" },
];

const reviewsStatic = [
    { text: "Best streaming app for regional content. Love watching Asal TV on the go!", user: "- Sarah M." },
    { text: "Great quality streaming and exclusive content. Highly recommended!", user: "- Ahmed K." },
    { text: "Perfect for staying connected with home content while traveling.", user: "- Fatima A." },
];

/* -------------------------------- Config -------------------------------- */
const BASE = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

const STATIC = {
    name: "Nasiye",
    heroTitle: "Your Mobile Entertainment Hub",
    heroDescription:
        "Revolutionary streaming platform bringing all Asal Media Group content directly to your mobile device. Watch live TV, on-demand shows, and exclusive content wherever you are.",
    heroBgImage: "/mobile-streaming-app-interface.png",

    aboutTitle: "Experience the App",
    aboutDescription:
        "See how Nasiye brings premium content to your fingertips with an intuitive, user-friendly interface.",
    aboutImage: "/mobile-streaming-app-interface.png",

    placeholder: "/placeholder.svg",
};

/* ------------------------------- Helpers -------------------------------- */
const isBlob = (s?: string | null) => !!s && /^blob:/i.test(s);
const text = (v: any, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);
const img = (v?: string | null, fallback?: string) => {
    if (!v || isBlob(v)) return fallback || STATIC.placeholder;
    const s = v.trim();
    if (/^https?:\/\//i.test(s)) return s;
    return `${BASE}${s.startsWith("/") ? "" : "/"}${s}`;
};
const firstArray = (...candidates: any[]) => candidates.find((a) => Array.isArray(a) && a.length > 0) || [];

/* ------------------------------- Animation ------------------------------- */
const sectionVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.8 } }),
};

/* -------------------------------- Skeletons ------------------------------ */
function HeroSkeleton() {
    return (
        <section className="relative min-h=[80vh] min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-primary/10">
            <div className="absolute inset-0 bg-muted/20 animate-pulse" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="space-y-4">
                        <div className="mx-auto h-12 w-64 rounded bg-muted animate-pulse" />
                        <div className="mx-auto h-6 w-[70%] max-w-xl rounded bg-muted animate-pulse" />
                        <div className="mx-auto h-6 w-[60%] max-w-md rounded bg-muted animate-pulse" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <div className="h-12 w-48 rounded bg-muted animate-pulse" />
                        <div className="h-12 w-48 rounded bg-muted animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ----------------------------- Child Cards ------------------------------ */
function FeatureCard({ feature }: { feature: any }) {
    const title = useTranslatedText(feature?.title);
    const description = useTranslatedText(feature?.description);
    return (
        <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
            <CardContent className="space-y-4 p-0">
                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(feature?.image, STATIC.placeholder)} alt={title || "Feature"} className="h-full w-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">{title || "Feature"}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description || ""}</p>
            </CardContent>
        </Card>
    );
}

function CategoryCard({ category }: { category: any }) {
    const name = useTranslatedText(category?.name);
    const count = useTranslatedText(category?.count);
    return (
        <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-background">
            <CardContent className="flex justify-between items-center p-0">
                <div>
                    <h3 className="font-semibold text-card-foreground">{name || "Category"}</h3>
                    <p className="text-sm text-muted-foreground">{count || ""}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-secondary" />
            </CardContent>
        </Card>
    );
}

function ReviewCard({ review }: { review: any }) {
    const textT = useTranslatedText(review?.text);
    const user = useTranslatedText(review?.user);
    const rating = Number(review?.rating || 5);
    return (
        <Card className="p-6 bg-background">
            <CardContent className="space-y-4 p-0">
                <div className="flex space-x-1">
                    {[...Array(Math.max(0, Math.min(5, rating)))].map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                </div>
                <p className="text-card-foreground italic">{textT}</p>
                <div className="text-sm text-muted-foreground">{user}</div>
            </CardContent>
        </Card>
    );
}

/* --------------------------------- Page --------------------------------- */
export default function NasiyePage() {
    const { t } = useLanguage();

    // Pull exactly one brand by slug
    const { data, isLoading } = useGetBrandsQuery({ slug: "nasiye", page: 1, limit: 1 });
    const brand = data?.data?.[0];
    const isPublished = String(brand?.status || "").toLowerCase() === "published";

    // Safe reads with published-only dynamic, then translate
    const name = useTranslatedText(text(isPublished ? brand?.name : null, STATIC.name));
    const heroTitle = useTranslatedText(text(isPublished ? brand?.heroTitle : null, STATIC.heroTitle));
    const heroDescription = useTranslatedText(text(isPublished ? brand?.heroDescription : null, STATIC.heroDescription));
    const heroBgImage = img(isPublished ? brand?.heroBgImage : null, STATIC.heroBgImage);

    const aboutTitle = useTranslatedText(text(isPublished ? brand?.aboutTitle : null, STATIC.aboutTitle));
    const aboutDescription = useTranslatedText(text(isPublished ? brand?.aboutDescription : null, STATIC.aboutDescription));
    const aboutImage = img(isPublished ? brand?.aboutImage : null, STATIC.aboutImage);

    // Dynamic lists with static fallbacks (no hooks inside map — use child components)
    const featuresList = useMemo(() => {
        const src = isPublished ? firstArray(brand?.platformFeatures) : [];
        const base = (src.length ? src : featuresStatic) as any[];
        return base.map((it: any) => ({
            title: text(it?.title ?? it?.name, "Feature"),
            description: text(it?.description, ""),
            image: img(it?.image, STATIC.placeholder),
        }));
    }, [isPublished, brand]);

    const categoriesList = useMemo(() => {
        const src = isPublished ? firstArray(brand?.contentCategories) : [];
        const base = (src.length ? src : categoriesStatic) as any[];
        return base.map((it: any) => ({
            name: text(it?.name ?? it?.title, "Category"),
            count: text(it?.count ?? it?.itemsCount ?? it?.subtitle, ""),
        }));
    }, [isPublished, brand]);

    const reviewsList = useMemo(() => {
        const src = isPublished ? firstArray(brand?.userReviews) : [];
        const base = (src.length ? src : reviewsStatic) as any[];
        return base
            .map((it: any) => ({
                text: text(it?.message ?? it?.content ?? it?.quote, ""),
                user: text(it?.person ?? it?.author ?? it?.name, ""),
                rating: Number(it?.stars || it?.starts || 5),
            }))
            .filter((r: any) => r.text);
    }, [isPublished, brand]);

    return (
        <>
            <Header />
            <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}>
                {/* Hero Section */}
                {isLoading ? (
                    <HeroSkeleton />
                ) : (
                    <motion.section
                        className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-primary/10"
                        variants={sectionVariant}
                        custom={0}
                    >
                        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('${heroBgImage}')` }} />
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="max-w-4xl mx-auto text-center space-y-8">
                                <div className="space-y-4">
                                    <motion.h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                        <motion.span className="text-secondary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
                                            {name}
                                        </motion.span>
                                        <br />
                                        <motion.span className="text-foreground" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}>
                                            {heroTitle}
                                        </motion.span>
                                    </motion.h1>
                                    <motion.p
                                        className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.7 }}
                                    >
                                        {heroDescription}
                                    </motion.p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
                                        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg">
                                            <Download className="h-5 w-5 mr-2" />
                                            {t("downloadForIOS")}
                                        </Button>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}>
                                        <Button size="lg" variant="outline" className="px-8 py-6 text-lg bg-transparent">
                                            <Smartphone className="h-5 w-5 mr-2" />
                                            {t("getOnAndroid")}
                                        </Button>
                                    </motion.div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50">
                                    {[
                                        { end: 1_000_000, labelKey: "downloads", plus: true },
                                        { end: 4.8, labelKey: "appRating", decimals: 1 },
                                        { end: 1_000, labelKey: "hoursContent", plus: true },
                                        { end: 24, labelKey: "liveStreaming", suffix: "/7" },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={stat.labelKey}
                                            className="text-center"
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.2 + i * 0.2, duration: 0.6 }}
                                        >
                                            <div className="text-3xl font-bold text-secondary">
                                                <CountUp
                                                    end={stat.end}
                                                    duration={2}
                                                    decimals={stat.decimals as number | undefined}
                                                    formattingFn={(n) => {
                                                        let formatted = String(n);
                                                        if (n >= 1e12) formatted = (n / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
                                                        else if (n >= 1e9) formatted = (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
                                                        else if (n >= 1e6) formatted = (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
                                                        else if (n >= 1e3) formatted = (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
                                                        if ((stat as any).plus) formatted += "+";
                                                        return formatted;
                                                    }}
                                                    suffix={(stat as any).suffix}
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Platform Features */}
                <motion.section className="py-24 bg-background" variants={sectionVariant} custom={1}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center space-y-4 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                                {t("platformFeatures")} <span className="text-secondary">{/* accent word optional */}</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                                {t("platformFeaturesSubtitle")}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuresList.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
                                >
                                    <FeatureCard feature={feature} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Content Categories */}
                <motion.section className="py-24 bg-muted/30" variants={sectionVariant} custom={2}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center space-y-4 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                                {t("contentCategories")} <span className="text-secondary">{/* accent */}</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                                {t("contentCategoriesSubtitle")}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoriesList.map((category, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                                >
                                    <CategoryCard category={category} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Reviews Section */}
                <motion.section className="py-24 bg-muted/30" variants={sectionVariant} custom={3}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center space-y-4 mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-balance">{t("userReviews")}</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {reviewsList.map((review, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                                >
                                    <ReviewCard review={review} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Final CTA */}
                <motion.section className="py-24 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent" variants={sectionVariant} custom={4}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center space-y-8"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-balance">{t("readyToStartStreaming")}</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
                                {t("finalCtaSubtitle")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
                                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg">
                                        <Download className="h-5 w-5 mr-2" />
                                        {t("downloadNow")}
                                    </Button>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
                                    <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                                        {t("learnMore")}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
            </motion.div>
            <Footer />
        </>
    );
}
