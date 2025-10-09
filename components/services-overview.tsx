"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Podcast as Broadcast, Megaphone, Users } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

type ServiceItem = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  features: string[];
};

export function ServicesOverview() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const services: ServiceItem[] = [
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

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance text-[#B5040F]">
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
              <Card
                key={service.title}
                className="group hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: "#F9FAFA" }}
              >
                <CardContent className="p-8">
                  <div className={`flex items-start ${isRTL ? "space-x-reverse" : ""} space-x-4`}>
                    <div className="p-0 rounded-full flex-shrink-0">
                      <IconComponent className="h-6 w-6" style={{ color: "#B5040F80" }} />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold" style={{ color: "#B5040F" }}>
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className={`flex items-center ${isRTL ? "space-x-reverse" : ""} space-x-2 text-sm text-muted-foreground`}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "#B5040F" }}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="px-8 bg-[#B5040F]">
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
