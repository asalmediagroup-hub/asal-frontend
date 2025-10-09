"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Award, Users, Calendar, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useGetBrandsQuery } from "@/slices/brandApi";

// ✅ imports for translation
import { useLanguage } from "@/components/language-provider";
import { useTranslatedText } from "@/hooks/use-translated-content";

const BASE = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

const STATIC = {
	name: "Asal TV",
	heroTitle: "Premium Television Content",
	heroDescription:
		"Award-winning television programming that informs, entertains, and inspires audiences across the region with quality content and professional broadcasting.",
	heroBgImage: "/television-studio-broadcasting-modern.png",

	aboutTitle: "Leading Television Network",
	aboutDescription:
		"Asal TV has been at the forefront of regional television broadcasting for over a decade, delivering high-quality content that resonates with diverse audiences. Our commitment to journalistic integrity, entertainment excellence, and cultural preservation has made us a trusted source of information and entertainment.",
	aboutImage: "/television-studio-broadcasting-modern.png",

	featuredTitle: "Featured",
	featuredDescription:
		"Discover our most popular shows and programs that keep audiences engaged and informed.",
	featuredItems: [
		{
			title: "Evening News",
			description: "Daily news program covering regional and international events",
			image: "/news-studio-evening-broadcast.png",
			href: "#",
			category: "News",
		},
		{
			title: "Cultural Stories",
			description: "Documentary series exploring regional culture and traditions",
			image: "/cultural-documentary-traditional-stories.png",
			href: "#",
			category: "Documentary",
		},
		{
			title: "Business Today",
			description: "Weekly business analysis and market insights",
			image: null,
			href: "#",
			category: "Business",
		},
	],
	placeholder: "/placeholder.svg",
};

// tiny helpers
const isBlob = (s?: string | null) => !!s && /^blob:/i.test(s);
const text = (v: any, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);
const href = (v: any) => {
	const s = typeof v === "string" ? v.trim() : "";
	return s || "#";
};
// image rule requested:
// - if empty/null/blob -> fallback
// - if starts with http -> use as is
// - else -> prefix NEXT_PUBLIC_API_IMAGE_URL
const img = (v?: string | null, fallback?: string) => {
	if (!v || isBlob(v)) return fallback || STATIC.placeholder;
	const s = v.trim();
	if (/^https?:\/\//i.test(s)) return s;
	return `${BASE}${s.startsWith("/") ? "" : "/"}${s}`;
};

/* ---------- Skeletons ---------- */
function HeroSkeleton() {
	return (
		<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted/30">
			<div className="absolute inset-0 bg-muted/20 animate-pulse" />
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<div className="space-y-4">
						<div className="mx-auto h-10 w-56 rounded bg-muted animate-pulse" />
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
					<div className="space-y-4">
						<div className="h-8 w-80 rounded bg-muted animate-pulse" />
						<div className="h-4 w-[90%] rounded bg-muted animate-pulse" />
						<div className="h-4 w-[85%] rounded bg-muted animate-pulse" />
						<div className="grid grid-cols-2 gap-6 pt-4">
							{[0, 1, 2, 3].map((i) => (
								<div key={i} className="h-5 w-44 rounded bg-muted animate-pulse" />
							))}
						</div>
					</div>
					<div className="h-72 w-full rounded-2xl bg-muted animate-pulse" />
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

/* ---------- Featured Card (per-item translation like ServiceCard) ---------- */
function FeaturedCard({ show }: { show: any }) {
	const { t } = useLanguage();
	const title = useTranslatedText(show?.title);
	const description = useTranslatedText(show?.description);
	const category = useTranslatedText(show?.category);
	const imgSrc = img(show?.image, STATIC.placeholder);

	return (
		<Card className="group hover:shadow-lg transition-all duration-300 bg-background overflow-hidden rounded-2xl">
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
							<span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow">
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
						variant="ghost"
						className="w-full flex items-center justify-center text-primary hover:bg-secondary hover:text-white"
					>
						<a href={href(show?.href)} target="_blank" rel="noopener noreferrer">
							<Play className="h-4 w-4 mr-2" />
							{t("watchNow")}
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/* ---------- Page ---------- */
export default function AsalTVStaticPage() {
	const { t } = useLanguage();

	// NOTE: this page is for a static URL; we still fetch the slug "asal-tv" only.
	const { data, isLoading } = useGetBrandsQuery({
		slug: "asal-tv",
		page: 1,
		limit: 1,
	});

	const brand = data?.data?.[0];
	const isPublished = String(brand?.status || "").toLowerCase() === "published";

	// Read with safe fallbacks (use dynamic only if published, otherwise STATIC)
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

	// FEEDBACK #1: loop *your* featuredItems; fall back to static only if API none
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
					<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted/30">
						<div
							className="absolute inset-0 bg-cover bg-center opacity-10"
							style={{ backgroundImage: `url('${heroBgImage}')` }}
						/>
						<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="max-w-4xl mx-auto text-center space-y-8">
								<div className="space-y-4">
									<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
										<span className="text-primary">{name}</span>
										<br />
										<span className="text-foreground">{heroTitle}</span>
									</h1>
									<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
										{heroDescription}
									</p>
								</div>

								{/* Static CTAs → localized */}
								<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
									<Button size="lg" className="px-8 py-6 text-lg">
										<Play className="h-5 w-5 mr-2" />
										{t("watchLive")}
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="px-8 py-6 text-lg bg-transparent"
									>
										{t("viewSchedule")}
									</Button>
								</div>

								{/* Static stats → localized */}
								<div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
									<div className="text-center">
										<div className="text-3xl font-bold text-primary">24/7</div>
										<div className="text-sm text-muted-foreground">{t("broadcasting")}</div>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-primary">15+</div>
										<div className="text-sm text-muted-foreground">{t("awardsWon")}</div>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-primary">500K+</div>
										<div className="text-sm text-muted-foreground">{t("dailyViewers")}</div>
									</div>
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
								<div className="space-y-6">
									<h2 className="text-3xl sm:text-4xl font-bold text-balance">
										{/* Keep stylized split, using translated aboutTitle */}
										{aboutTitle.split(" ").slice(0, 1).join(" ") || "Leading"}{" "}
										<span className="text-primary">
											{aboutTitle.split(" ").slice(1, 2).join(" ") || "Television"}
										</span>{" "}
										{aboutTitle.split(" ").slice(2).join(" ") || "Network"}
									</h2>

									<p className="text-muted-foreground leading-relaxed">
										{aboutDescription}
									</p>

									<div className="grid grid-cols-2 gap-6">
										<div className="flex items-center space-x-3">
											<Calendar className="h-6 w-6 text-primary" />
											<span className="text-sm">{t("twentyFourSevenProgramming")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Play className="h-6 w-6 text-primary" />
											<span className="text-sm">{t("liveBroadcasting")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Award className="h-6 w-6 text-primary" />
											<span className="text-sm">{t("awardWinningContent")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Users className="h-6 w-6 text-primary" />
											<span className="text-sm">{t("expertTeam")}</span>
										</div>
									</div>
								</div>

								<div className="relative">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={aboutImage}
										alt="Asal TV Studio"
										className="rounded-2xl shadow-lg"
									/>
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
									{t("featured")} <span className="text-primary">{t("programs")}</span>
								</h2>
								<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
									{featuredDescription}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{featuredItems.map((show: any, index: number) => (
									<FeaturedCard key={index} show={show} />
								))}
							</div>
						</div>
					</section>
				)}

				{/* CTA (static) */}
				<section className="py-24 bg-primary/5">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center space-y-8">
							<h2 className="text-3xl sm:text-4xl font-bold text-balance">
								{t("experiencePremiumOn")} <span className="text-secondary">Nasiye</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
								{t("nasiyeCtaSubtitle")}
							</p>
							<Button
								size="lg"
								className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-lg"
							>
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
