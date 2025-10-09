"use client";

import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";

function formatNumber(value: number, addPlus = false) {
  let formatted = value.toString();
  if (value >= 1e12) formatted = (value / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  else if (value >= 1e9) formatted = (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  else if (value >= 1e6) formatted = (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  else if (value >= 1e3) formatted = (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (addPlus) formatted += "+";
  return formatted;
}

const cardData = [
  { id: 1, image: "/Asal Tv.jpg" },
  { id: 2, image: "/Jiil Media.jpg" },
  { id: 3, image: "/Masrax Logo.jpg" },
  { id: 4, image: "/Nasiye Logo.jpg" },
];

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <motion.section
        className="relative min-h-[80vh] flex items-center justify-center bg-[url('/hero-F.jpg')] bg-cover bg-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 pb-32">
            {/* Main Heading */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-balance"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <span className="text-white">{t("heroTitleConnecting")}</span>{" "}
                <span className="text-white">{t("heroTitleCultures")}</span>
                <br />
                <span className="text-white">{t("heroTitleThrough")}</span>{" "}
                <span className="text-[#EB5059]">{t("heroTitleMedia")}</span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-white max-w-2xl mx-auto text-pretty leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                {t("heroSubtitleMain")}
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                size="lg"
                className="px-8 py-6 text-lg bg-transparent border-2 border-white text-white hover:bg-white/10"
              >
                <Download className="h-5 w-5 mr-2" />
                {t("footerDownloadNasiyeTitle")}
              </Button>

              <Button size="lg" className="px-8 py-6 text-lg bg-white text-secondary hover:bg-white/90">
                <Play className="h-5 w-5 mr-2" />
                {t("watchOurStory")}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="relative -mt-24 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {cardData.map((card, index) => (
              <motion.div
                key={card.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image || "/placeholder.svg"}
                  alt="Brand"
                  className="w-full h-48 object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="bg-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">{/* spacer below cards */}</div>
      </div>
    </div>
  );
}
