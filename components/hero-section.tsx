"use client";

import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import * as React from "react";

type BrandCard = { id: number; image: string; name: string; color: string };

const cardData: BrandCard[] = [
  { id: 1, image: "/Asal TV.jpg",    name: "Asal TV",    color: "#B5040F" },
  { id: 2, image: "/Jiil Media.jpg", name: "Jiil Media", color: "#0F6CAE" },
  { id: 3, image: "/Masrax Logo.jpg",name: "Masrax",     color: "#B80102" },
  { id: 4, image: "/Nasiye Logo.jpg",name: "Nasiye",     color: "#D42026" },
];

// Motion helpers
const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const lineVariant = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const wordVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroSection() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* HERO */}
      <motion.section
        className="relative min-h-[80vh] flex items-center justify-center bg-[url('/hero-F.jpg')] bg-cover bg-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerStagger}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 pb-28 sm:pb-32">
            {/* Headline with animated words + underline sweep */}
            <motion.div className="space-y-4" variants={containerStagger}>
              {/* Line 1 */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight group inline-block"
                variants={lineVariant}
              >
                <motion.span variants={wordVariant} className="text-white inline-block mr-2">
                  {t("heroTitleConnecting")}
                </motion.span>
                <motion.span variants={wordVariant} className="text-white inline-block">
                  {t("heroTitleCultures")}
                </motion.span>

                <span
                  className="block h-1 w-0 group-hover:w-full transition-all duration-500 mt-3 mx-auto"
                  style={{ backgroundColor: "#ffffff" }}
                  aria-hidden
                />
              </motion.h1>

              {/* Line 2 */}
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight group inline-block"
                variants={lineVariant}
              >
                <motion.span variants={wordVariant} className="text-white inline-block mr-2">
                  {t("heroTitleThrough")}
                </motion.span>

                {/* “Media” with animated gradient shimmer */}
                <motion.span
                  variants={wordVariant}
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #ffffff 20%, #EB5059 40%, #ffffff 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : { backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }
                  }
                  transition={
                    prefersReducedMotion
                      ? {}
                      : { duration: 2.2, repeat: Infinity, ease: "linear" }
                  }
                >
                  {t("heroTitleMedia")}
                </motion.span>

                <span
                  className="block h-1 w-0 group-hover:w-full transition-all duration-500 mt-3 mx-auto"
                  style={{ backgroundColor: "#EB5059" }}
                  aria-hidden
                />
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto text-pretty leading-relaxed"
                variants={lineVariant}
                transition={{ delay: 0.15 }}
              >
                {t("heroSubtitleMain")}
              </motion.p>
            </motion.div>

            {/* CTA Buttons — magnetic lift + shine sweep */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
              variants={lineVariant}
              transition={{ delay: 0.25 }}
            >
              {/* Primary (transparent) */}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -3, rotate: -0.3, scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-7 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-transparent border-2 border-white text-white hover:bg-white/10 relative overflow-hidden"
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/20"
                      initial={{ x: "-120%" }}
                      whileHover={{ x: "160%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      aria-hidden
                    />
                  )}
                  <Download className="h-5 w-5 mr-2" />
                  {t("footerDownloadNasiyeTitle")}
                </Button>
              </motion.div>

              {/* Secondary (white) */}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { y: -3, rotate: 0.3, scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-7 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-white text-secondary hover:bg-white/90 relative overflow-hidden"
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-black/10"
                      initial={{ x: "-120%" }}
                      whileHover={{ x: "160%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      aria-hidden
                    />
                  )}
                  <Play className="h-5 w-5 mr-2" />
                  {t("watchOurStory")}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* BRAND CARDS */}
      <div className="relative -mt-20 sm:-mt-24 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {cardData.map((card, index) => {
              const hoverTransform = prefersReducedMotion
                ? {}
                : { y: -6, rotate: (index % 2 === 0 ? 0.8 : -0.8), scale: 1.01 };

              return (
                <motion.div
                  key={card.id}
                  className="group relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-offset-2"
                  whileHover={hoverTransform}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.6 }}
                  style={{ outline: "none" }}
                  tabIndex={0}
                  aria-label={card.name}
                >
                  {/* Glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 0 2px ${card.color}1F, 0 16px 40px ${card.color}22` }}
                  />

                  {/* Bottom bar */}
                  <span
                    className="absolute inset-x-0 bottom-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: card.color }}
                  />

                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      src={card.image || "/placeholder.svg"}
                      alt={card.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      initial={{ scale: 1, filter: "brightness(0.96)" }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.06, filter: "brightness(1.02)" }}
                      transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.6 }}
                    />

                    {/* Top-right chip (now actually shows on card hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm"
                        style={{ background: card.color }}
                      >
                        {card.name}
                      </span>
                    </div>

                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="bg-white pt-12 sm:pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" />
      </div>
    </div>
  );
}
