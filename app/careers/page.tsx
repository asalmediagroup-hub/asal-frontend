"use client"

import { useMemo } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/animated-counter"
import {
  MapPin,
  Clock,
  Users,
  Briefcase,
  Heart,
  Zap,
  Globe,
  Coffee,
  Wifi,
  Car,
  GraduationCap,
  ArrowRight,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// ---- Helper: localized date (uses your provider's "language" code mapping) ----
function useDateFormatter(langCode: string) {
  // Map your provider codes to real BCP-47 locales
  const locale = langCode === "ar" ? "ar" : langCode === "so" ? "so" : "en"
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" })
}

export default function CareersPage() {
  const { t, language } = useLanguage()
  const fmt = useDateFormatter(language)

  // ---- Stats (labels are translated) ----
  const stats = [
    { value: 250, suffix: "+", label: t("careers.stats.teamMembers") },
    { value: 15, suffix: "+", label: t("careers.stats.countries") },
    { value: 95, suffix: "%", label: t("careers.stats.employeeSatisfaction") },
    { value: 8, suffix: "+", label: t("careers.stats.officeLocations") },
  ]

  // ---- Benefits (icon + translated title/description) ----
  const benefits = [
    { icon: Heart, title: t("careers.benefits.health.title"), description: t("careers.benefits.health.desc") },
    { icon: GraduationCap, title: t("careers.benefits.learning.title"), description: t("careers.benefits.learning.desc") },
    { icon: Globe, title: t("careers.benefits.global.title"), description: t("careers.benefits.global.desc") },
    { icon: Coffee, title: t("careers.benefits.balance.title"), description: t("careers.benefits.balance.desc") },
    { icon: Car, title: t("careers.benefits.transport.title"), description: t("careers.benefits.transport.desc") },
    { icon: Wifi, title: t("careers.benefits.tech.title"), description: t("careers.benefits.tech.desc") },
  ]

  // ---- Departments (translated name + count) ----
  const departments = [
    { name: t("careers.departments.production"), count: 12, icon: Briefcase },
    { name: t("careers.departments.technical"), count: 8, icon: Zap },
    { name: t("careers.departments.editorial"), count: 6, icon: Users },
    { name: t("careers.departments.marketing"), count: 4, icon: Globe },
  ]

  // ---- Jobs (all fields are translation keys) ----
  const jobOpenings = useMemo(
    () => [
      {
        id: 1,
        title: t("careers.jobs.seniorVideoProducer.title"),
        department: t("careers.departments.production"),
        location: t("careers.locations.mogadishu"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.5plus"),
        description: t("careers.jobs.seniorVideoProducer.desc"),
        requirements: [
          t("careers.jobs.seniorVideoProducer.req.1"),
          t("careers.jobs.seniorVideoProducer.req.2"),
          t("careers.jobs.seniorVideoProducer.req.3"),
          t("careers.jobs.seniorVideoProducer.req.4"),
        ],
        posted: "2024-03-10",
      },
      {
        id: 2,
        title: t("careers.jobs.digitalContentCreator.title"),
        department: t("careers.departments.jiilMedia"),
        location: t("careers.locations.remote"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.2to4"),
        description: t("careers.jobs.digitalContentCreator.desc"),
        requirements: [
          t("careers.jobs.digitalContentCreator.req.1"),
          t("careers.jobs.digitalContentCreator.req.2"),
          t("careers.jobs.digitalContentCreator.req.3"),
          t("careers.jobs.digitalContentCreator.req.4"),
        ],
        posted: "2024-03-08",
      },
      {
        id: 3,
        title: t("careers.jobs.broadcastEngineer.title"),
        department: t("careers.departments.technical"),
        location: t("careers.locations.hargeisa"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.3plus"),
        description: t("careers.jobs.broadcastEngineer.desc"),
        requirements: [
          t("careers.jobs.broadcastEngineer.req.1"),
          t("careers.jobs.broadcastEngineer.req.2"),
          t("careers.jobs.broadcastEngineer.req.3"),
          t("careers.jobs.broadcastEngineer.req.4"),
        ],
        posted: "2024-03-05",
      },
      {
        id: 4,
        title: t("careers.jobs.newsReporter.title"),
        department: t("careers.departments.asalTV"),
        location: t("careers.locations.nairobi"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.2plus"),
        description: t("careers.jobs.newsReporter.desc"),
        requirements: [
          t("careers.jobs.newsReporter.req.1"),
          t("careers.jobs.newsReporter.req.2"),
          t("careers.jobs.newsReporter.req.3"),
          t("careers.jobs.newsReporter.req.4"),
        ],
        posted: "2024-03-03",
      },
      {
        id: 5,
        title: t("careers.jobs.softwareDeveloper.title"),
        department: t("careers.departments.nasiyePlatform"),
        location: t("careers.locations.dubai"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.3plus"),
        description: t("careers.jobs.softwareDeveloper.desc"),
        requirements: [
          t("careers.jobs.softwareDeveloper.req.1"),
          t("careers.jobs.softwareDeveloper.req.2"),
          t("careers.jobs.softwareDeveloper.req.3"),
          t("careers.jobs.softwareDeveloper.req.4"),
        ],
        posted: "2024-03-01",
      },
      {
        id: 6,
        title: t("careers.jobs.marketingSpecialist.title"),
        department: t("careers.departments.marketing"),
        location: t("careers.locations.london"),
        type: t("careers.types.fullTime"),
        experience: t("careers.experience.2to4"),
        description: t("careers.jobs.marketingSpecialist.desc"),
        requirements: [
          t("careers.jobs.marketingSpecialist.req.1"),
          t("careers.jobs.marketingSpecialist.req.2"),
          t("careers.jobs.marketingSpecialist.req.3"),
          t("careers.jobs.marketingSpecialist.req.4"),
        ],
        posted: "2024-02-28",
      },
    ],
    [t]
  )

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                {t("careers.title")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                {t("careers.heroSubtitle")}
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {t("careers.cta.viewOpenPositions")}
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("careers.whyJoin.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("careers.whyJoin.subtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((b, i) => {
                const Icon = b.icon
                let cardClass = "text-center p-6 hover:shadow-lg transition-shadow"
                let contentClass = "pt-6"
                let titleClass = "text-xl font-semibold mb-3"
                let descClass = "text-muted-foreground"
                if (i % 2 !== 0) {
                  cardClass += " bg-secondary text-white"
                  titleClass += " text-white"
                  descClass = "text-white"
                }
                if (i % 2 === 0) {
                  cardClass += " border-2 border-primary shadow-md bg-background"
                }
                return (
                  <Card key={i} className={cardClass}>
                    <CardContent className={contentClass}>
                      <Icon className={`h-12 w-12 mx-auto mb-4 ${i % 2 !== 0 ? "text-white" : "text-primary"}`} />
                      <h3 className={titleClass}>{b.title}</h3>
                      <p className={descClass}>{b.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Open Positions by Department */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("careers.openPositions.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("careers.openPositions.subtitle")}
              </p>
            </div>

            {/* Department Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {departments.map((dept, index) => {
                const Icon = dept.icon
                return (
                  <Card key={index} className="text-center p-4">
                    <CardContent className="pt-4">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("careers.openPositions.count")}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{job.department}</Badge>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="outline">{job.experience}</Badge>
                        </div>
                      </div>
                      <Button className="mt-4 md:mt-0">
                        {t("careers.jobs.applyNow")} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {t("careers.jobs.postedOn")}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{job.description}</p>
                    <div>
                      <h4 className="font-semibold mb-2">{t("careers.jobs.keyRequirements")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("careers.cta.impactTitle")}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {t("careers.cta.impactSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                {t("careers.cta.submitResume")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                {t("careers.cta.contactHR")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
