"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

type Brand = {
  name: string;
  description: string;
  href: string;
  image: string;
  bodyColor: string;
  titleClass: string;
  buttonClass: string; // include bg color e.g. "bg-[#B5040F]"
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

// 3s “from wides to center” with slight overshoot
function itemVariants(index: number, isMobile: boolean) {
  const fromLeft = index % 4 < 2;
  const startX = isMobile ? 0 : fromLeft ? -180 : 180;

  return {
    hidden: {
      opacity: 0,
      x: startX,
      y: isMobile ? 28 : 0,
      scale: 0.95,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      x: [startX, fromLeft ? 20 : -20, 0],
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        times: [0, 0.75, 1],
        duration: 3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
}

function BrandCard({
  brand,
  index,
  ctas,
  isRTL,
  prefersReducedMotion,
  isMobile,
}: {
  brand: Brand;
  index: number;
  ctas: { learnMore: string };
  isRTL: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}) {
  const hoverTransform = prefersReducedMotion
    ? {}
    : { y: -6, rotate: isRTL ? -0.6 : 0.6, scale: 1.01 };

  const barColor =
    brand.buttonClass.match(/#([0-9A-Fa-f]{3,8})/g)?.[0] ?? "#B5040F";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.35 }}
      variants={itemVariants(index, isMobile)}
      whileHover={hoverTransform}
      whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}
      className="group relative"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow:
            "0 0 0 2px rgba(181,4,15,0.10), 0 18px 40px rgba(0,0,0,0.06)",
        }}
      />
      <Card
        className="overflow-hidden border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-xl rounded-2xl p-0 flex flex-col"
        style={{ backgroundColor: brand.bodyColor }}
      >
        {/* Image */}
        <div className="relative w-full aspect-[4/3]">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1, filter: "brightness(0.98)" }}
            whileHover={
              prefersReducedMotion ? {} : { scale: 1.05, filter: "brightness(1.02)" }
            }
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <Image
              src={brand.image || "/placeholder.svg"}
              alt={brand.name}
              fill
              className="object-cover object-center block"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={index < 2}
            />
          </motion.div>

          {/* Sliding brand-color bar */}
          <span
            className="absolute inset-x-0 bottom-0 h-1 w-0 group-hover:w-full transition-[width] duration-500"
            style={{ background: barColor }}
          />
        </div>

        {/* Content */}
        <div className="p-7 md:p-8 space-y-4 flex-1">
          <div className={`${isRTL ? "text-right" : "text-left"} space-y-2`}>
            <h3 className={`text-xl font-semibold ${brand.titleClass}`}>
              {brand.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {brand.description}
            </p>
          </div>

          {/* Button AFTER text, aligned end (LTR right, RTL left) */}
          <div
            className={`mt-4 flex ${
              isRTL ? "justify-start" : "justify-end"
            }`}
          >
            <Button asChild variant="ghost" className={brand.buttonClass}>
              <Link href={brand.href} className="flex items-center gap-2 px-3 py-2">
                <span>{ctas.learnMore}</span>
                <ArrowRight
                  className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function BrandHighlights() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const brands: Brand[] = React.useMemo(
    () => [
      {
        name: t("brandAsalTVName"),
        description: t("brandAsalTVDesc"),
        href: "/brands/asal-tv",
        image: "/Asal.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#B5040F]",
        buttonClass: "px-2 py-2 text-white bg-[#B5040F]",
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
          "px-2 py-2 text-white bg-[#FAB53C] hover:bg-[#FAB53C]/90",
      },
      {
        name: t("brandMasraxProductionName"),
        description: t("brandMasraxProductionDesc"),
        href: "/brands/masrax-production",
        image: "/Masrax.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#B50102]",
        buttonClass: "px-2 py-2 text-white bg-[#B50102]",
      },
      {
        name: t("brandNasiyePlatformName"),
        description: t("brandNasiyePlatformDesc"),
        href: "/brands/nasiye",
        image: "/Nasiye.jpg",
        bodyColor: "#F9FAFA",
        titleClass: "text-[#D01F25]",
        buttonClass: "px-2 py-2 text-white bg-[#D32A31]",
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
      initial={false}
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <div className="container mx-auto px-6 sm:px-8 lg:px-10">
        <div className="max-w-[90rem] mx-auto">
          {/* Header */}
          <motion.div
            className="text-center space-y-4 mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-[#B5040F]">
              {ctas.titleA} <span>{ctas.titleB}</span> {ctas.titleC}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              {ctas.subtitle}
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8"
            variants={gridVariants}
          >
            {brands.map((brand, idx) => (
              <BrandCard
                key={brand.name}
                brand={brand}
                index={idx}
                ctas={{ learnMore: ctas.learnMore }}
                isRTL={isRTL}
                prefersReducedMotion={!!prefersReducedMotion}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
