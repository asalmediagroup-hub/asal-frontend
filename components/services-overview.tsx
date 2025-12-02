"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Podcast as Broadcast, Megaphone, Users } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { motion, useReducedMotion } from "framer-motion";
import * as React from "react";
import { useGetHomesQuery } from "@/slices/homeApi";

type ServiceItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  features: string[];
};

export function ServicesOverview() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";
  const prefersReducedMotion = useReducedMotion();

  // Fetch servicesPreview from home slice
  const { data: homeList } = useGetHomesQuery?.() ?? { data: undefined };
  const servicesPreview = homeList?.data?.[0]?.servicesPreview ?? [];

  // Icons remain static in order
  const staticIcons = [Video, Broadcast, Megaphone, Users];
  const services: ServiceItem[] = servicesPreview.length
    ? servicesPreview.slice(0, 4).map((svc: any, i: number) => ({
      title: svc?.title ?? "",
      description: svc?.description ?? "",
      icon: staticIcons[i % staticIcons.length],
      features: Array.isArray(svc?.keyServices) ? svc.keyServices : [],
    }))
    : [
      {
        title: t("serviceContentProduction"),
        description: t("serviceContentProductionDesc"),
        icon: Video,
        features: [
          t("preProductionPlanning"),
          t("professionalFilming"),
          t("postProductionEditing"),
          t("distributionSupport"),
        ],
      },
      {
        title: t("serviceBroadcastingVOD"),
        description: t("serviceBroadcastingVODDesc"),
        icon: Broadcast,
        features: [
          t("liveTVBroadcasting"),
          t("vodPlatformManagement"),
          t("multiPlatformDistribution"),
          t("audienceAnalytics"),
        ],
      },
      {
        title: t("serviceAdvertisingSolutions"),
        description: t("serviceAdvertisingSolutionsDesc"),
        icon: Megaphone,
        features: [
          t("mediaPlanning"),
          t("creativeDevelopment"),
          t("campaignManagement"),
          t("performanceTracking"),
        ],
      },
      {
        title: t("serviceConsultingServices"),
        description: t("serviceConsultingServicesDesc"),
        icon: Users,
        features: [
          t("strategyDevelopment"),
          t("marketAnalysis"),
          t("brandPositioning"),
          t("growthPlanning"),
        ],
      },
    ];

  const hoverTilt = (rtl: boolean) =>
    prefersReducedMotion
      ? {}
      : { rotate: rtl ? -1.2 : 1.2, y: -4, scale: 1.01 };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-secondary">
            {t("servicesPageTitle")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            {t("servicesPageSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.title}
                whileHover={hoverTilt(isRTL)}
                whileTap={prefersReducedMotion ? {} : { scale: 0.997 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.6 }}
                className="group relative"
              >
                {/* Soft brand glow ring on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "0 0 0 2px rgba(181,4,15,0.12), 0 12px 30px rgba(181,4,15,0.10)" }} />

                <Card
                  className="relative overflow-hidden rounded-2xl border border-transparent hover:border-secondary/10 transition-all duration-300"
                  style={{ backgroundColor: "#F9FAFA" }}
                >
                  {/* Subtle gradient wash that intensifies on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardContent className="p-8">
                    <div className={`flex items-start ${isRTL ? "space-x-reverse" : ""} space-x-4`}>
                      {/* Icon */}
                      <div className="p-2 rounded-full flex-shrink-0 bg-white/70 shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <IconComponent
                          className="h-6 w-6 transition-colors duration-300"
                          className="text-secondary/50"
                        />
                      </div>

                      {/* Text block */}
                      <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                          <h3
                            className="text-xl font-semibold transition-colors duration-300"
                            className="text-secondary"
                          >
                            {service.title}
                          </h3>

                          <p className="text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-[#6b7280]">
                            {service.description}
                          </p>
                        </div>

                        <ul className="space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className={`flex items-center ${isRTL ? "space-x-reverse" : ""} space-x-2 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-[#4b5563]`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                                className="bg-secondary"
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>

                  {/* Brand-colored bottom bar that slides in on hover */}
                  <div
                    className="absolute left-0 bottom-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    className="bg-secondary"
                    aria-hidden
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="px-8 bg-secondary hover:bg-secondary/90 transition-colors"
          >
            <Link href="/services">
              {t("viewAllServices")}
              <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
