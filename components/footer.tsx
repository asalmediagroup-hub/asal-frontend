"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Download,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useGetHomesQuery } from "@/slices/homeApi";

export function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();
  const isRTL = language === "ar";

  // Home data (site name + logo)
  const { data: homeList } = useGetHomesQuery?.() ?? { data: undefined };
  const home = homeList?.data?.[0];
  const siteName = home?.siteName || "Asal Media Corporation";
  const resolveImageUrl = (src?: string | null): string => {
    if (!src) return "/Logo Asal-03.svg";
    const s = src.trim();
    if (!s) return "/Logo Asal-03.svg";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
    const base = process.env.NEXT_PUBLIC_API_IMAGE_URL || "";
    if (s.startsWith("/")) return `${base}${s}`;
    return `${base}/${s}`;
  };
  const logoSrc = resolveImageUrl(home?.logoImage);

  const handleDownloadClick = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=tv.nasiye.client&hl=en_US&pli=1",
      "_blank",
      "noopener,noreferrer",
    )
  }
  const handleDownloadClick2 = () => {
    window.open(
      "https://apps.apple.com/us/app/nasiye/id6504266625",
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <footer className="bg-card border-t" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={logoSrc}
                alt={siteName}
                className="h-8 w-8"
              />
              <span className="font-bold text-lg text-card-foreground">
                {siteName}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footerCompanyTagline")}
            </p>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-card-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-card-foreground"
                aria-label="Twitter / X"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-card-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-card-foreground"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">
              {t("footerQuickLinks")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("aboutNav")}
              </Link>
              <Link
                href="/services"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("servicesNav")}
              </Link>
              <Link
                href="/portfolio"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("portfolioNav")}
              </Link>
              <Link
                href="/news"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("newsPressTitle")}
              </Link>
              <Link
                href="/careers"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("careers")}
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("contactNav")}
              </Link>
            </nav>
          </div>

          {/* Our Brands */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">
              {t("footerOurBrands")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/brands/asal-tv"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("brandAsalTVName")}
              </Link>
              <Link
                href="/brands/jiil-media"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("brandJiilMediaName")}
              </Link>
              <Link
                href="/brands/masrax-production"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("brandMasraxProductionName")}
              </Link>
              <Link
                href="/brands/nasiye"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("brandNasiyePlatformName")}
              </Link>
            </nav>
          </div>

          {/* Download Nasiye */}
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">
              {t("footerDownloadNasiyeTitle")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("footerDownloadNasiyeDesc")}
            </p>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleDownloadClick2}
                style={{ backgroundColor: "#B5040F", color: "#fff" }}
              >
                <Smartphone className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("appStore")}
              </Button>
              <Button onClick={handleDownloadClick} variant="outline" className="w-full bg-transparent">
                <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("googlePlay")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              {t("copyrightPrefix")} {year} {siteName}. {t("allRightsReserved")}
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("privacyPolicy")}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-card-foreground transition-colors text-sm"
              >
                {t("termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
