"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

type Brand = {
  name: string;
  description: string;
  href: string;
  image: string;
  bodyColor: string;
  titleClass: string;
  buttonClass: string;
};

function BrandCard({
  brand,
  index,
  ctas,
  isRTL,
}: {
  brand: Brand;
  index: number;
  ctas: { learnMore: string };
  isRTL: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.12, duration: 0.5 }}
    >
      <Card
        className="group overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg rounded-2xl p-0"
        style={{ backgroundColor: brand.bodyColor }}
      >
        {/* Image */}
        <div className="relative w-full h-56">
          <Image
            src={brand.image || "/placeholder.svg"}
            alt={brand.name}
            fill
            className="object-cover object-center block"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 2}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className={`text-xl font-semibold ${brand.titleClass}`}>{brand.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {brand.description}
            </p>
          </div>

          <Button asChild variant="ghost" className={brand.buttonClass}>
            <Link href={brand.href} className="flex items-center gap-2 px-2 py-2">
              {/* Text first, then icon (flip spacing for RTL) */}
              <span>{ctas.learnMore}</span>
              <ArrowRight
                className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function BrandHighlights() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const brands: Brand[] = React.useMemo(
    () => [
      {
        name: t("brandAsalTVName"),
        description: t("brandAsalTVDesc"),
        href: "/brands/asal-tv",
        image: "/Asal.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#B5040F]",
        buttonClass: "px-2 py-2 group/btn p-0 h-auto text-white bg-[#B5040F]",
      },
      {
        name: t("brandJiilMediaName"),
        description: t("brandJiilMediaDesc"),
        href: "/brands/jiil-media",
        image: "/Jiil.jpg",
        bodyColor: "#F9FAFA",
        titleClass:
          "text-transparent bg-clip-text bg-gradient-to-r from-[#1071B6] to-[#FAB53C]",
        buttonClass:
          "px-2 py-2 group/btn p-0 h-auto text-white bg-[#FAB53C] hover:text-white hover:bg-[#FAB53C]",
      },
      {
        name: t("brandMasraxProductionName"),
        description: t("brandMasraxProductionDesc"),
        href: "/brands/masrax-production",
        image: "/Masrax.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#B50102]",
        buttonClass: "px-2 py-2 group/btn p-0 h-auto text-white bg-[#B50102]",
      },
      {
        name: t("brandNasiyePlatformName"),
        description: t("brandNasiyePlatformDesc"),
        href: "/brands/nasiye",
        image: "/Nasiye.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#D01F25]",
        buttonClass: "px-2 py-2 group/btn p-0 h-auto text-white bg-[#D32A31]",
      },
    ],
    [t]
  );

  const ctas = React.useMemo(
    () => ({
      titleA: t("brandsSectionTitleOur"),
      titleB: t("brandsSectionTitleMedia"),
      titleC: t("brandsSectionTitleBrands"),
      subtitle: t("brandsSectionSubtitle"),
      learnMore: t("learnMore"),
      featured: t("featured"),
      downloadNow: t("downloadNow"),
      explorePlatform: t("explorePlatform"),
      nasiyeHighlightDesc: t("nasiyeHighlightDesc"),
    }),
    [t]
  );

  return (
    <motion.section
      className="py-24 bg-background"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-[#B5040F]">
            {ctas.titleA} <span>{ctas.titleB}</span> {ctas.titleC}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {ctas.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {brands.map((brand, idx) => (
            <BrandCard key={brand.name} brand={brand} index={idx} ctas={{ learnMore: ctas.learnMore }} isRTL={isRTL} />
          ))}
        </div>

        {/* Nasiye Highlight */}
        <motion.div
          className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="h-8 w-8 text-secondary" />
              <h3 className="text-2xl font-bold text-card-foreground">
                {ctas.featured}: {t("brandNasiyePlatformName")}
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {ctas.nasiyeHighlightDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Smartphone className="h-4 w-4 mr-2" />
                  {ctas.downloadNow}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <Button variant="outline" asChild>
                  <Link href="/brands/nasiye">
                    {ctas.explorePlatform}
                    <ArrowRight
                      className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                    />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
