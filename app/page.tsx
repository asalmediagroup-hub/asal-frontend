import { HeroSection } from "@/components/hero-section"
import { BrandHighlights } from "@/components/brand-highlights"
import { ServicesOverview } from "@/components/services-overview"
import { TestimonialsSection } from "@/components/testimonials-section"
import { NewsPreview } from "@/components/news-preview"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <><Header />
      <div className="flex flex-col">
        <HeroSection />
        <BrandHighlights />
        <ServicesOverview />
        <TestimonialsSection />
        <NewsPreview />
      </div>
      <Footer />
    </>
  )
}
