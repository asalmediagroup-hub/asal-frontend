"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetHomesQuery } from "@/slices/homeApi";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Download, Globe, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/language-provider";
import type { Language } from "@/components/language-provider";
import { resolveImageUrl } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(""); // which dropdown is open
  const [showHiddenMenus, setShowHiddenMenus] = useState(false); // "More..." hover state

  // Home data (site name + logo)
  const { data: homeList } = useGetHomesQuery?.() ?? { data: undefined };
  const home = homeList?.data?.[0];
  const siteName = home?.siteName || "Asal Media Corporation";
  const siteNameShort = siteName?.split(" ")[0] || "Asal";
  const logoSrc = resolveImageUrl(home?.logoImage, "/Logo Asal-03.svg");

  // Language provider
  const { language, setLanguage, t } = useLanguage();

  // --- RTL + <html> attrs ---
  const isRTL = language === "ar";
  const applyDir = (lang: Language) => {
    const langMap: Record<Language, string> = { eng: "en", ar: "ar", so: "so" };
    const htmlLang = langMap[lang] ?? "en";
    const rtl = lang === "ar";
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", htmlLang);
    }
  };
  useEffect(() => {
    applyDir(language);
  }, [language]);

  // Prefer a translation key, but gracefully fall back to a default label
  const tt = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  // Language menu options (codes from provider: "eng" | "ar" | "so")
  const languageOptions: { code: Language; name: string; flag: string }[] = [
    { code: "eng", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "so", name: "Somali", flag: "🇸🇴" },
  ];

  const handleChangeLanguage = (code: Language) => setLanguage(code);

  // ---- Labels (from translations with safe fallbacks) ----
  const labels = {
    home: tt("homeNav", "Home"),
    about: tt("aboutNav", "About"),
    services: tt("servicesNav", "Services"),
    brands: tt("brandsNav", "Brands"),
    packages: tt("packagesNav", "Packages"),
    news: tt("newsNav", "News"),
    portfolio: tt("portfolioNav", "Portfolio"),
    careers: tt("careers", "Careers"),
    nasiye: t("Nasiye"),
    contact: tt("contactNav", "Contact"),
    faqs: tt("faqsNav", "FAQs"),
    more: tt("moreNav", "More..."),
    admin: tt("adminNav", "Admin"),
    brandAsalTV: tt("brandAsalTVName", "Asal TV"),
    brandJiil: tt("brandJiilMediaName", "Jiil Media"),
    brandMasrax: tt("brandMasraxProductionName", "Masrax Production"),
    brandNasiye: tt("brandNasiyePlatformName", "Nasiye Platform"),
    diini: t("Diini"),
    social: t("Social"),
    sports: t("Sports"),
  };

  // Main menu
  const mainMenu: Array<
    | { href: string; label: string }
    | {
      href: string;
      label: string;
      dropdown: { href: string; label: string }[];
    }
  > = [
      { href: "/", label: labels.home },
      { href: "/about", label: labels.about },
      { href: "/services", label: labels.services },
      {
        href: "/brands",
        label: labels.brands,
        dropdown: [
          { href: "/brands/asal-tv", label: labels.brandAsalTV },
          { href: "/brands/jiil-media", label: labels.brandJiil },
          { href: "/brands/masrax-production", label: labels.brandMasrax },
          { href: "/brands/nasiye", label: labels.brandNasiye },
        ],
      },
      {
        href: "/packages",
        label: labels.packages,
        dropdown: [
          { href: "/packages/diini", label: labels.diini },
          { href: "/packages/social", label: labels.social },
          { href: "/packages/news", label: labels.news },
          { href: "/packages/sports", label: labels.sports },
        ],
      },
    ];

  // Hidden menus (for "More...")
  const hiddenMenus: { href: string; label: string }[] = [
    { href: "/news", label: labels.news },
    { href: "/portfolio", label: labels.portfolio },
    { href: "/careers", label: labels.careers },
    { href: "/nasiye", label: labels.nasiye },
    { href: "/contact", label: labels.contact },
    { href: "/FAQs", label: labels.faqs },
  ];

  const handleDownloadClick = () => {
    window.open(
      "https://play.google.com/store/apps/details?id=tv.nasiye.client&hl=en_US&pli=1",
      "_blank",
      "noopener,noreferrer",
    )
  }


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={siteName}
              width={150}
              height={75}
              className="h-14 w-auto md:h-16 md:w-auto lg:h-20 lg:w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className={`hidden lg:flex items-center space-x-6 ${isRTL ? "space-x-reverse" : ""
              }`}
          >
            {mainMenu.map((item, idx) =>
              "dropdown" in item ? (
                <div key={idx} className="relative">
                  <button
                    className="text-foreground hover:text-primary transition-colors whitespace-nowrap flex items-center"
                    onClick={() =>
                      setOpenDropdown(openDropdown === item.label ? "" : item.label)
                    }
                    onBlur={() => setTimeout(() => setOpenDropdown(""), 150)}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 mt-2 w-56 bg-background border rounded shadow-lg z-50">
                      <div className="flex flex-col">
                        {item.dropdown.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            href={sub.href}
                            className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={idx}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )
            )}

            {/* More... */}
            <div
              className="relative group"
              onMouseEnter={() => setShowHiddenMenus(true)}
              onMouseLeave={() => !showMore && setShowHiddenMenus(false)}
            >
              <Button
                variant="ghost"
                size="lg"
                className={`px-4 py-2 text-center text-base ${showHiddenMenus || showMore ? "bg-muted" : ""
                  }`}
                tabIndex={0}
                onClick={() =>
                  setShowMore((prev) => {
                    const next = !prev;
                    setShowHiddenMenus(next);
                    return next;
                  })
                }
              >
                {labels.more}
              </Button>
              {(showHiddenMenus || showMore) && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-background border rounded shadow-lg z-50 flex flex-col transition-opacity duration-200"
                  onMouseEnter={() => setShowHiddenMenus(true)}
                  onMouseLeave={() => !showMore && setShowHiddenMenus(false)}
                >
                  {hiddenMenus.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setShowMore(false);
                        setShowHiddenMenus(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop: Language + Actions */}
          <div
            className={`hidden lg:flex items-center space-x-3 xl:space-x-4 ${isRTL ? "space-x-reverse" : ""
              }`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-4 w-4" />
                <span className="hidden xl:inline">
                  {languageOptions.find((l) => l.code === language)?.flag}
                </span>
                <span>{language.toUpperCase()}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    className="flex items-center space-x-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleDownloadClick} className="bg-secondary hover:bg-secondary/90 text-white" size="sm">
              <Download className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline">{labels.nasiye}</span>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              {mainMenu.map((item, idx) =>
                "dropdown" in item ? (
                  <div key={idx} className="relative">
                    <button
                      className="text-foreground hover:text-primary transition-colors whitespace-nowrap flex items-center w-full text-left"
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? "" : item.label)
                      }
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    {openDropdown === item.label && (
                      <div className="mt-2 ml-4 flex flex-col bg-background border rounded shadow-lg z-50">
                        {item.dropdown.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            href={sub.href}
                            className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                            onClick={() => {
                              setOpenDropdown("");
                              setIsMenuOpen(false);
                            }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={idx}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Mobile "More..." */}
              <Button
                variant="ghost"
                size="sm"
                className="px-2 w-fit"
                onClick={() => setShowMore(!showMore)}
              >
                {labels.more}
              </Button>

              {showMore && (
                <div className="flex flex-col mt-2">
                  {hiddenMenus.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setShowMore(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* MOBILE: Language + Actions */}
              <div className="mt-4 pt-4 border-t space-y-3">
                {/* Language switcher (mobile) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="mr-2">
                        {languageOptions.find((l) => l.code === language)?.flag}
                      </span>
                      <span className="font-medium">{language.toUpperCase()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {languageOptions.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className="flex items-center space-x-2"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Action buttons (mobile) */}
                <div className="flex gap-2">
                  <Button onClick={handleDownloadClick} className="bg-secondary hover:bg-secondary/90 text-white flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    {labels.nasiye}
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
