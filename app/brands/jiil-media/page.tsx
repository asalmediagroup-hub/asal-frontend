"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Smartphone, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useGetBrandsQuery } from "@/slices/brandApi";

// ✅ translation imports (same pattern as your Services/Asal TV pages)
import { useLanguage } from "@/components/language-provider";
import { useTranslatedText } from "@/hooks/use-translated-content";

/* -------------------------------- Config -------------------------------- */
const BASE = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

const STATIC = {
	name: "Jiil Media",
	heroTitle: "Digital-First Content",
	heroDescription:
		"Innovative digital media platform creating engaging content for the next generation. We speak the language of young audiences through fresh formats and authentic storytelling.",
	heroBgImage: "/digital-media-young-audience-content.png",

	aboutTitle: "Connecting with Young Minds",
	aboutDescription:
		"Jiil Media understands the pulse of today's youth. We create content that resonates with young audiences through authentic storytelling, innovative formats, and platforms they love. From viral social media content to thought-provoking mini-docs, we bridge the gap between traditional media and digital culture.",
	aboutImage: "/digital-media-young-audience-content.png",

	featuredTitle: "Popular",
	featuredDescription:
		"Explore our most engaging content series that have captured the attention of young audiences.",
	featuredItems: [
		{
			title: "Youth Voices",
			description: "Podcast series featuring young entrepreneurs and changemakers",
			image: null,
			href: "#",
			category: "Podcast",
		},
		{
			title: "Digital Trends",
			description: "Weekly show covering technology and digital culture",
			image: "/digital-trends-technology-show.png",
			href: "#",
			category: "Tech",
		},
		{
			title: "Creative Spotlight",
			description: "Showcasing emerging artists and creative talents",
			image: "/creative-artists-spotlight-studio.png",
			href: "#",
			category: "Arts",
		},
	],
	placeholder: "/placeholder.svg",

	// Static KPI labels (code-only; translated via t())
	stats: [
		{ value: "2M+", labelKey: "socialFollowers" },
		{ value: "50+", labelKey: "contentSeries" },
		{ value: "18-35", labelKey: "targetAge" },
	],
};

/* ------------------------------- Tiny helpers ------------------------------- */
const isBlob = (s?: string | null) => !!s && /^blob:/i.test(s);
const text = (v: any, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);
const href = (v: any) => {
	const s = typeof v === "string" ? v.trim() : "";
	return s || "#";
};
// Image rule:
// - empty/null/blob  -> fallback (or placeholder)
// - starts with http -> as-is
// - else             -> prefix NEXT_PUBLIC_API_IMAGE_URL (and ensure single slash)
const img = (v?: string | null, fallback?: string) => {
	if (!v || isBlob(v)) return fallback || STATIC.placeholder;
	const s = v.trim();
	if (/^https?:\/\//i.test(s)) return s;
	return `${BASE}${s.startsWith("/") ? "" : "/"}${s}`;
};

/* --------------------------- Featured Card (item) --------------------------- */
function FeaturedCard({ item }: { item: any }) {
	const { t } = useLanguage();
	const title = useTranslatedText(item?.title);
	const description = useTranslatedText(item?.description);
	const category = useTranslatedText(item?.category);
	const imgSrc = img(item?.image, STATIC.placeholder);

	return (
		<Card className="group bg-background overflow-hidden rounded-2xl border border-border/50 hover:border-secondary/40 hover:shadow-xl transition-all duration-300">
			<CardContent className="p-0">
				<div className="relative w-full h-48">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imgSrc ?? "/placeholder.svg"}
						alt={title || "Untitled"}
						className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
					/>
					{category ? (
						<div className="absolute top-4 left-4">
							<span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium shadow">
								{category}
							</span>
						</div>
					) : null}
				</div>
				<div className="p-6 space-y-4">
					<h3 className="text-xl font-semibold text-card-foreground">{title || "Untitled"}</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">{description || " "}</p>
					<Button
						asChild
						variant="outline"
						className="w-full flex items-center justify-center border-secondary text-secondary hover:bg-secondary hover:text-white"
					>
						<a href={href(item?.href)} target="_blank" rel="noopener noreferrer">
							<Play className="h-4 w-4 mr-2" />
							{t("watchNow")}
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/* -------------------------------- Skeletons -------------------------------- */
function HeroSkeleton() {
	return (
		<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-muted/30">
			<div className="absolute inset-0 bg-muted/20 animate-pulse" />
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<div className="space-y-4">
						<div className="mx-auto h-10 w-64 rounded bg-muted animate-pulse" />
						<div className="mx-auto h-6 w-[70%] max-w-xl rounded bg-muted animate-pulse" />
					</div>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<div className="h-12 w-40 rounded bg-muted animate-pulse" />
						<div className="h-12 w-40 rounded bg-muted animate-pulse" />
					</div>
					<div className="grid grid-cols-3 gap-8 pt-12">
						{[0, 1, 2].map((i) => (
							<div key={i} className="space-y-2">
								<div className="mx-auto h-8 w-20 rounded bg-muted animate-pulse" />
								<div className="mx-auto h-4 w-24 rounded bg-muted animate-pulse" />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function AboutSkeleton() {
	return (
		<section className="py-24 bg-background">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="h-72 w-full rounded-2xl bg-muted animate-pulse order-1 lg:order-none" />
					<div className="space-y-4 order-2 lg:order-none">
						<div className="h-8 w-80 rounded bg-muted animate-pulse" />
						<div className="h-4 w-[90%] rounded bg-muted animate-pulse" />
						<div className="h-4 w-[85%] rounded bg-muted animate-pulse" />
						<div className="grid grid-cols-2 gap-6 pt-4">
							{[0, 1, 2, 3].map((i) => (
								<div key={i} className="h-5 w-44 rounded bg-muted animate-pulse" />
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function FeaturedSkeleton() {
	return (
		<section className="py-24 bg-muted/30">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center space-y-4 mb-16">
					<div className="mx-auto h-8 w-72 rounded bg-muted animate-pulse" />
					<div className="mx-auto h-4 w-[70%] max-w-xl rounded bg-muted animate-pulse" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{[0, 1, 2].map((i) => (
						<Card key={i} className="overflow-hidden rounded-2xl">
							<CardContent className="p-0">
								<div className="h-48 w-full bg-muted animate-pulse" />
								<div className="p-6 space-y-3">
									<div className="h-6 w-40 rounded bg-muted animate-pulse" />
									<div className="h-4 w-[90%] rounded bg-muted animate-pulse" />
									<div className="h-9 w-full rounded bg-muted animate-pulse" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

/* --------------------------------- Page --------------------------------- */
export default function JiilMediaPage() {
	const { t } = useLanguage();

	// fetch exactly one brand by slug
	const { data, isLoading } = useGetBrandsQuery({ slug: "jiil-media", page: 1, limit: 1 });
	const brand = data?.data?.[0];

	// Only use dynamic data when this brand is *published*. Otherwise, fall back to STATIC.
	const isPublished = String(brand?.status || "").toLowerCase() === "published";

	// Safe reads with fallbacks (prefer brand's values only if published)
	const nameRaw = text(isPublished ? brand?.name : null, STATIC.name);
	const heroTitleRaw = text(isPublished ? brand?.heroTitle : null, STATIC.heroTitle);
	const heroDescriptionRaw = text(isPublished ? brand?.heroDescription : null, STATIC.heroDescription);
	const heroBgImage = img(isPublished ? brand?.heroBgImage : null, STATIC.heroBgImage);

	const aboutTitleRaw = text(isPublished ? brand?.aboutTitle : null, STATIC.aboutTitle);
	const aboutDescriptionRaw = text(isPublished ? brand?.aboutDescription : null, STATIC.aboutDescription);
	const aboutImage = img(isPublished ? brand?.aboutImage : null, STATIC.aboutImage);

	const featuredDescriptionRaw = text(
		isPublished ? brand?.featuredDescription : null,
		STATIC.featuredDescription
	);

	// ✅ Translate dynamic text fields
	const name = useTranslatedText(nameRaw);
	const heroTitle = useTranslatedText(heroTitleRaw);
	const heroDescription = useTranslatedText(heroDescriptionRaw);
	const aboutTitle = useTranslatedText(aboutTitleRaw);
	const aboutDescription = useTranslatedText(aboutDescriptionRaw);
	const featuredDescription = useTranslatedText(featuredDescriptionRaw);

	// Prefer API featuredItems if present *and* published; else use static
	const featuredItems = useMemo(() => {
		const list = (isPublished ? (brand?.featuredItems ?? []) : []) as any[];
		const source = list.length > 0 ? list : STATIC.featuredItems;
		return source
			.slice()
			.sort((a: any, b: any) => Number(a?.order || 0) - Number(b?.order || 0))
			.map((it: any) => ({
				title: text(it?.title, "Untitled"),
				description: text(it?.description, ""),
				image: img(it?.image, STATIC.placeholder),
				href: href(it?.href),
				category: text(it?.category, ""),
			}))
			.filter((it) => it.title);
	}, [brand, isPublished]);

	return (
		<>
			<Header />
			<div className="flex flex-col">
				{/* HERO */}
				{isLoading ? (
					<HeroSkeleton />
				) : (
					<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-muted/30">
						<div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('${heroBgImage}')` }} />
						<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="max-w-4xl mx-auto text-center space-y-8">
								<div className="space-y-4">
									<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
										<span className="text-secondary">{name}</span>
										<br />
										<span className="text-foreground">{heroTitle}</span>
									</h1>
									<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">{heroDescription}</p>
								</div>

								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg">
										<Play className="h-5 w-5 mr-2" />
										{t("watchContent")}
									</Button>
									<Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
										{t("followUs")}
									</Button>
								</div>

								{/* Static stats (labels localized via t) */}
								<div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
									{STATIC.stats.map((s, i) => (
										<div key={i} className="text-center">
											<div className="text-3xl font-bold text-secondary">{s.value}</div>
											<div className="text-sm text-muted-foreground">{t(s.labelKey)}</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</section>
				)}

				{/* ABOUT */}
				{isLoading ? (
					<AboutSkeleton />
				) : (
					<section className="py-24 bg-background">
						<div className="container mx-auto px-4 sm:px-6 lg:px-8">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
								<div className="relative order-1 lg:order-none">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={aboutImage} alt="Jiil Media Content Creation" className="rounded-2xl shadow-lg" />
								</div>
								<div className="space-y-6 order-2 lg:order-none">
									<h2 className="text-3xl sm:text-4xl font-bold text-balance">
										{aboutTitle.split(" ").slice(0, 1).join(" ") || "Connecting"}{" "}
										<span className="text-secondary">{aboutTitle.split(" ").slice(1, 2).join(" ") || "with"}</span>{" "}
										{aboutTitle.split(" ").slice(2).join(" ") || "Young Minds"}
									</h2>
									<p className="text-muted-foreground leading-relaxed">{aboutDescription}</p>
									<div className="grid grid-cols-2 gap-6">
										<div className="flex items-center space-x-3">
											<Smartphone className="h-6 w-6 text-secondary" />
											<span className="text-sm">{t("mobileFirstContent")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<TrendingUp className="h-6 w-6 text-secondary" />
											<span className="text-sm">{t("viralCampaigns")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Users className="h-6 w-6 text-secondary" />
											<span className="text-sm">{t("communityDriven")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Play className="h-6 w-6 text-secondary" />
											<span className="text-sm">{t("multiPlatform")}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				)}

				{/* FEATURED */}
				{isLoading ? (
					<FeaturedSkeleton />
				) : (
					<section className="py-24 bg-muted/30">
						<div className="container mx-auto px-4 sm:px-6 lg:px-8">
							<div className="text-center space-y-4 mb-16">
								<h2 className="text-3xl sm:text-4xl font-bold text-balance">
									{t("popular")} <span className="text-secondary">{t("content")}</span>
								</h2>
								<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
									{featuredDescription}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{featuredItems.map((item: any, index: number) => (
									<FeaturedCard key={index} item={item} />
								))}
							</div>
						</div>
					</section>
				)}

				{/* CTA */}
				<section className="py-24 bg-secondary/5">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center space-y-8">
							<h2 className="text-3xl sm:text-4xl font-bold text-balance">
								{t("getJiilOn")} <span className="text-secondary">Nasiye</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
								{t("jiilCtaSubtitle")}
							</p>
							<Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg">
								{t("downloadNasiyeApp")}
								<ArrowRight className="h-4 w-4 ml-2" />
							</Button>
						</div>
					</div>
				</section>
			</div>
			<Footer />
		</>
	);
}
