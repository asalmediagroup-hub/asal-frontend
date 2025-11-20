"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building,
  Globe,
  MessageSquare,
  Users,
  Briefcase,
  Camera,
  Tv,
  Smartphone,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    department: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: integrate with your API / RTK Query
    console.log("Form submitted:", formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const offices = [
    {
      city: t("contact.offices.mogadishu.city"),
      country: t("contact.offices.mogadishu.country"),
      address: "Km4 Junction, Hodan District, Mogadishu, Somalia",
      phone: "+252 61 234 5678",
      email: "mogadishu@asalmediagroup.com",
      hours: t("contact.hours.sundayThursday"),
      departments: [t("contact.brands.asalTv"), t("contact.brands.masrax"), t("contact.departments.administration")],
      isHeadquarters: true,
    },
    {
      city: t("contact.offices.hargeisa.city"),
      country: t("contact.offices.hargeisa.country"),
      address: "Ahmed Dhagah Street, Hargeisa, Somaliland",
      phone: "+252 63 345 6789",
      email: "hargeisa@asalmediagroup.com",
      hours: t("contact.hours.sundayThursday"),
      departments: [t("contact.brands.asalTv"), t("contact.departments.newsBureau")],
      isHeadquarters: false,
    },
    {
      city: t("contact.offices.nairobi.city"),
      country: t("contact.offices.nairobi.country"),
      address: "Westlands Business Park, Nairobi, Kenya",
      phone: "+254 20 123 4567",
      email: "nairobi@asalmediagroup.com",
      hours: t("contact.hours.mondayFriday"),
      departments: [t("contact.brands.jiilMedia"), t("contact.departments.regionalOps")],
      isHeadquarters: false,
    },
    {
      city: t("contact.offices.dubai.city"),
      country: t("contact.offices.dubai.country"),
      address: "Dubai Media City, Dubai, UAE",
      phone: "+971 4 123 4567",
      email: "dubai@asalmediagroup.com",
      hours: t("contact.hours.sundayThursday"),
      departments: [t("contact.brands.nasiye"), t("contact.departments.technology")],
      isHeadquarters: false,
    },
  ]

  const departments = [
    { value: "general", label: t("contact.form.options.generalInquiry"), icon: MessageSquare },
    { value: "asal-tv", label: t("contact.brands.asalTv"), icon: Tv },
    { value: "jiil-media", label: t("contact.brands.jiilMedia"), icon: Smartphone },
    { value: "masrax-production", label: t("contact.brands.masrax"), icon: Camera },
    { value: "nasiye-platform", label: t("contact.brands.nasiye"), icon: Globe },
    { value: "careers", label: t("contact.form.options.careers"), icon: Briefcase },
    { value: "partnerships", label: t("contact.form.options.partnerships"), icon: Users },
  ]

  const socialLinks = [
    { platform: t("contact.social.facebook"), url: "https://www.facebook.com/asaltv.so", followers: "2.5M" },
    { platform: t("contact.social.twitter"), url: "https://twitter.com/asalmediagroup", followers: "1.8M" },
    { platform: t("contact.social.instagram"), url: "https://www.instagram.com/asaltv.so/", followers: "3.2M" },
    { platform: t("contact.social.linkedin"), url: "https://www.linkedin.com/company/asaltv-so/", followers: "500K" },
    { platform: t("contact.social.youtube"), url: "https://www.youtube.com/@asaltvso", followers: "4.1M" },
    { platform: t("contact.social.tiktok"), url: "https://www.tiktok.com/@asaltv.so", followers: "2.8M" },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                {t("contact.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="p-8">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl mb-2">{t("contact.form.title")}</CardTitle>
                  <p className="text-muted-foreground">{t("contact.form.subtitle")}</p>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t("contact.form.fullName")} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder={t("contact.form.fullNamePlaceholder")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("contact.form.email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder={t("contact.form.emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder={t("contact.form.phonePlaceholder")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">{t("contact.form.company")}</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          placeholder={t("contact.form.companyPlaceholder")}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">{t("contact.form.department")}</Label>
                        <Select onValueChange={(value) => handleInputChange("department", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("contact.form.selectDepartment")} />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => {
                              const Icon = dept.icon
                              return (
                                <SelectItem key={dept.value} value={dept.value}>
                                  <div className="flex items-center">
                                    <Icon className="h-4 w-4 mr-2" />
                                    {dept.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">{t("contact.form.subject")} *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder={t("contact.form.subjectPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">{t("contact.form.message")} *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder={t("contact.form.messagePlaceholder")}
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4 mr-2" />
                      {t("contact.form.send")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t("contact.info.title")}</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t("contact.info.generalInquiries")}</p>
                        <p className="text-muted-foreground">info@asalmediagroup.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t("contact.info.mainOffice")}</p>
                        <p className="text-muted-foreground">+252 61 234 5678</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t("contact.info.headquarters")}</p>
                        <p className="text-muted-foreground">
                          Km4 Junction, Hodan District
                          <br />
                          Mogadishu, Somalia
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">{t("contact.info.businessHours")}</p>
                        <p className="text-muted-foreground">{t("contact.hours.sundayThursday")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">{t("contact.social.title")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium">{social.platform}</span>
                        <Badge variant="secondary">{social.followers}</Badge>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("contact.offices.title")}</h2>
              <p className="text-xl text-muted-foreground">{t("contact.offices.subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {offices.map((office, index) => (
                <Card key={index} className="relative hover:shadow-lg transition-shadow">
                  {office.isHeadquarters && (
                    <Badge className="absolute -top-2 -right-2 bg-secondary">{t("contact.info.headquarters")}</Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {office.city}, {office.country}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{office.address}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{office.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{office.email}</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{office.hours}</p>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">{t("contact.offices.departments")}:</p>
                        <div className="flex flex-wrap gap-1">
                          {office.departments.map((dept, deptIndex) => (
                            <Badge key={deptIndex} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("contact.cta.title")}</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{t("contact.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                {t("contact.cta.callNow")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("contact.cta.liveChat")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
