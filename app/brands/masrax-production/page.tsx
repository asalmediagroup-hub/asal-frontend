"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Camera, Film, Award, Users, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useGetBrandsQuery } from "@/slices/brandApi";

import { useLanguage } from "@/components/language-provider";
import { useTranslatedText } from "@/hooks/use-translated-content";

/* -------------------------------- Config -------------------------------- */
const BASE = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";

const STATIC = {
	name: "Masrax Production",
	heroTitle: "Storytelling Excellence",
	heroDescription:
		"Full-service production house creating compelling stories for film, television, and digital platforms. From concept to completion, we bring visions to life with professional expertise.",
	heroBgImage: "/film-production-studio-equipment.png",

	aboutTitle: "Professional Production Services",
	aboutDescription:
		"Masrax Production combines creative vision with technical expertise to deliver exceptional content across all media formats. Our experienced team handles every aspect of production, from initial concept development to final delivery, ensuring your story is told with impact and authenticity.",
	aboutImage: "/film-production-studio-equipment.png",

	featuredTitle: "Featured",
	featuredDescription:
		"Explore some of our most successful productions that have captivated audiences and won critical acclaim.",
	featuredItems: [
		{
			title: "Desert Dreams",
			description: "Award-winning documentary about traditional desert communities",
			image: "/desert-documentary-traditional-communities.png",
			href: "#",
			category: "Documentary",
		},
		{
			title: "City Lights",
			description: "Drama series exploring modern urban life and relationships",
			image: null,
			href: "#",
			category: "Drama Series",
		},
		{
			title: "Heritage Stories",
			description: "Cultural preservation project documenting regional traditions",
			image: "/cultural-heritage-traditional-stories.png",
			href: "#",
			category: "Cultural",
		},
	],
	placeholder: "/placeholder.svg",

	stats: [
		{ value: "100+", labelKey: "projectsCompleted" },
		{ value: "25+", labelKey: "awardsWon" },
		{ value: "10+", labelKey: "yearsExperience" },
	],
};

/* ------------------------------- Helpers ------------------------------- */
const isBlob = (s?: string | null) => !!s && /^blob:/i.test(s);
const text = (v: any, fb: string) => (typeof v === "string" && v.trim() ? v.trim() : fb);
const href = (v: any) => {
	const s = typeof v === "string" ? v.trim() : "";
	return s || "#";
};
const img = (v?: string | null, fallback?: string) => {
	if (!v || isBlob(v)) return fallback || STATIC.placeholder;
	const s = v.trim();
	if (/^https?:\/\//i.test(s)) return s;
	return `${BASE}${s.startsWith("/") ? "" : "/"}${s}`;
};

/* ------------------------------- Skeletons ------------------------------- */
function HeroSkeleton() {
	return (
		<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-chart-3/10 via-background to-muted/30">
			<div className="absolute inset-0 bg-muted/20 animate-pulse" />
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<div className="space-y-4">
						<div className="mx-auto h-10 w-72 rounded bg-muted animate-pulse" />
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

/* --------------- Child card to keep hooks out of loops --------------- */
function FeaturedCard({ project }: { project: any }) {
	const title = useTranslatedText(project?.title);
	const description = useTranslatedText(project?.description);
	const category = useTranslatedText(project?.category);
	const imgSrc = img(project?.image, STATIC.placeholder);
	return (
		<Card className="group bg-background overflow-hidden rounded-2xl border border-border/50 hover:border-chart-3/40 hover:shadow-xl transition-all duration-300">
			<CardContent className="p-0">
				<div className="relative w-full h-48">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={imgSrc}
						alt={title || "Untitled"}
						className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
					/>
					{category ? (
						<div className="absolute top-4 left-4">
							<span className="bg-chart-3 text-white px-3 py-1 rounded-full text-xs font-medium shadow">
								{category}
							</span>
						</div>
					) : null}
				</div>
				<div className="p-6 space-y-4">
					<h3 className="text-xl font-semibold text-card-foreground">{title || "Untitled"}</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">{description || " "}</p>
					<Button
						variant="outline"
						className="w-full flex items-center justify-center border-chart-3 text-chart-3 hover:bg-chart-3/10 hover:text-chart-3"
					>
						<Play className="h-4 w-4 mr-2" />
						View Project
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

/* --------------------------------- Page --------------------------------- */
export default function MasraxProductionPage() {
	const { t } = useLanguage();

	// fetch exactly one brand by slug
	const { data, isLoading } = useGetBrandsQuery({ slug: "masrax-production", page: 1, limit: 1 });
	const brand = data?.data?.[0];
	const isPublished = String(brand?.status || "").toLowerCase() === "published";

	// Top-level translations with hooks (OK here)
	const name = useTranslatedText(text(isPublished ? brand?.name : null, STATIC.name));
	const heroTitle = useTranslatedText(text(isPublished ? brand?.heroTitle : null, STATIC.heroTitle));
	const heroDescription = useTranslatedText(text(isPublished ? brand?.heroDescription : null, STATIC.heroDescription));
	const heroBgImage = img(isPublished ? brand?.heroBgImage : null, STATIC.heroBgImage);

	const aboutTitle = useTranslatedText(text(isPublished ? brand?.aboutTitle : null, STATIC.aboutTitle));
	const aboutDescription = useTranslatedText(text(isPublished ? brand?.aboutDescription : null, STATIC.aboutDescription));
	const aboutImage = img(isPublished ? brand?.aboutImage : null, STATIC.aboutImage);

	const featuredDescription = useTranslatedText(
		text(isPublished ? brand?.featuredDescription : null, STATIC.featuredDescription)
	);

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
					<section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-chart-3/10 via-background to-muted/30">
						<div
							className="absolute inset-0 bg-cover bg-center opacity-10"
							style={{ backgroundImage: `url('${heroBgImage}')` }}
						/>

						<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="max-w-4xl mx-auto text-center space-y-8">
								<div className="space-y-4">
									<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
										<span className="text-chart-3">{name}</span>
										<br />
										<span className="text-foreground">{heroTitle}</span>
									</h1>
									<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
										{heroDescription}
									</p>
								</div>

								<div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50">
									{STATIC.stats.map((s, i) => (
										<div key={i} className="text-center">
											<div className="text-3xl font-bold text-chart-3">{s.value}</div>
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
								<div className="space-y-6">
									<h2 className="text-3xl sm:text-4xl font-bold text-balance">
										{aboutTitle.split(" ").slice(0, 1).join(" ") || "Professional"}{" "}
										<span className="text-chart-3">{aboutTitle.split(" ").slice(1, 2).join(" ") || "Production"}</span>{" "}
										{aboutTitle.split(" ").slice(2).join(" ") || "Services"}
									</h2>
									<p className="text-muted-foreground leading-relaxed">{aboutDescription}</p>
									<div className="grid grid-cols-2 gap-6">
										<div className="flex items-center space-x-3">
											<Film className="h-6 w-6 text-chart-3" />
											<span className="text-sm">{t("filmProduction")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Camera className="h-6 w-6 text-chart-3" />
											<span className="text-sm">{t("tvContent")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Award className="h-6 w-6 text-chart-3" />
											<span className="text-sm">{t("awardWinning")}</span>
										</div>
										<div className="flex items-center space-x-3">
											<Users className="h-6 w-6 text-chart-3" />
											<span className="text-sm">{t("expertTeam")}</span>
										</div>
									</div>
								</div>
								<div className="relative">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={aboutImage} alt="Masrax Production Studio" className="rounded-2xl shadow-lg" />
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
									{t("featured")} <span className="text-chart-3">{t("projects")}</span>
								</h2>
								<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
									{featuredDescription}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{featuredItems.map((project: any, index: number) => (
									<FeaturedCard key={index} project={project} />
								))}
							</div>
						</div>
					</section>
				)}

				{/* CTA */}
				<section className="py-24 bg-chart-3/5">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center space-y-8">
							<h2 className="text-3xl sm:text-4xl font-bold text-balance">
								{t("watchMasraxOn")} <span className="text-secondary">Nasiye</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
								{t("masraxCtaSubtitle")}
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
