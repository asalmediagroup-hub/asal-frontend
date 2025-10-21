// app/(site)/about/page.tsx
"use client";

import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";
import { Users, Globe, Award, Zap, TrendingUp, ShieldCheck, Lightbulb } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, value: 2500000, suffix: "+", label: t("monthlyViewers") },
    { icon: Globe, value: 15, suffix: "+", label: t("countries") },
    { icon: Award, value: 50, suffix: "+", label: t("awardsWon") },
    { icon: Zap, value: 10000, suffix: "+", label: t("contentHours") },
  ];

  const values = [
  { title: t("culturalIntegrity"), description: t("culturalIntegrityDesc"), icon: Globe },
  { title: t("excellence"), description: t("excellenceDesc"), icon: Award },
  { title: t("inclusivity"), description: t("inclusivityDesc"), icon: Users },
  { title: t("empowerment"), description: t("empowermentDesc"), icon: TrendingUp },
  { title: t("transparencyTrust"), description: t("transparencyTrustDesc"), icon: ShieldCheck },
  { title: t("innovation"), description: t("innovationDesc"), icon: Lightbulb }
];

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                {t("aboutTitle")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                {t("aboutSubtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t("ourStory")}
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="text-xl leading-relaxed mb-6">{t("storyParagraph1")}</p>
                <p className="text-lg leading-relaxed mb-6">{t("storyParagraph2")}</p>
                <p className="text-lg leading-relaxed">{t("storyParagraph3")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("ourValues")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("valuesSubtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("visionTitle")}</h2>
              <p className="text-xl text-muted-foreground mb-4">{t("visionP1")}</p>
            </div>
          </div>
        </section>
        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("missionTitle")}</h2>
              <p className="text-xl text-muted-foreground mb-4">{t("missionP1")}</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyToJoin")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("discoverOpportunities")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                {t("careers")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                {t("contact")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
