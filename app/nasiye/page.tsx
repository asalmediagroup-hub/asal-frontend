"use client";

import {
  Smartphone,
  CheckCircle,
  Star,
  Users,
  BookOpen,
  PlayCircle,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";

export default function NasiyePage() {
  const { t } = useLanguage();

  const FEATURES = [
    {
      icon: CheckCircle,
      title: t("nasiye.features.dailyReminders.title"),
      desc: t("nasiye.features.dailyReminders.desc"),
    },
    {
      icon: Star,
      title: t("nasiye.features.curatedContent.title"),
      desc: t("nasiye.features.curatedContent.desc"),
    },
    {
      icon: Users,
      title: t("nasiye.features.community.title"),
      desc: t("nasiye.features.community.desc"),
    },
  ];

  const CATEGORIES = [
    {
      icon: BookOpen,
      title: t("nasiye.categories.quranTafsir.title"),
      desc: t("nasiye.categories.quranTafsir.desc"),
    },
    {
      icon: PlayCircle,
      title: t("nasiye.categories.lecturesPodcasts.title"),
      desc: t("nasiye.categories.lecturesPodcasts.desc"),
    },
    {
      icon: Users,
      title: t("nasiye.categories.familyYouth.title"),
      desc: t("nasiye.categories.familyYouth.desc"),
    },
    {
      icon: Download,
      title: t("nasiye.categories.downloads.title"),
      desc: t("nasiye.categories.downloads.desc"),
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16" style={{ backgroundColor: "#D01F25" }}>
          <div className="container mx-auto px-4 flex flex-col items-center text-center text-white">
            <Smartphone className="w-16 h-16 mb-4" />
            <h1 className="text-4xl font-bold mb-4">{t("nasiye.hero.title")}</h1>
            <p className="text-lg max-w-2xl mb-6">
              {t("nasiye.hero.subtitle")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="https://apps.apple.com/" target="_blank" rel="noopener">
                <span className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition font-semibold text-white text-sm">
                  <Download className="w-5 h-5" />
                  {t("nasiye.hero.buttons.appStore")}
                </span>
              </Link>
              <Link href="https://play.google.com/" target="_blank" rel="noopener">
                <span className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition font-semibold text-white text-sm">
                  <Download className="w-5 h-5" />
                  {t("nasiye.hero.buttons.playStore")}
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10" style={{ color: "#D01F25" }}>
              {t("nasiye.features.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 text-center">
                  <f.icon className="w-10 h-10 mx-auto mb-4 text-[#D01F25]" />
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10" style={{ color: "#D01F25" }}>
              {t("nasiye.categories.title")}
            </h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {CATEGORIES.map((c, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 text-center">
                  <c.icon className="w-8 h-8 mx-auto mb-3 text-[#D01F25]" />
                  <h4 className="font-semibold mb-1">{c.title}</h4>
                  <p className="text-gray-600 text-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
