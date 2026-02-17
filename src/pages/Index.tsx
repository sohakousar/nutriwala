import GlobalShaderLayout from "@/components/layout/GlobalShaderLayout";
import HeroSection from "@/components/landing/HeroSection";
import WhyNutriwala from "@/components/landing/WhyNutriwala";
import HealthBenefits from "@/components/landing/HealthBenefits";
import ProductHighlights from "@/components/landing/ProductHighlights";
import TestimonialsColumnsSection from "@/components/landing/TestimonialsColumnsSection";
import NewsletterCTA from "@/components/landing/NewsletterCTA";
import { Footerdemo } from "@/components/ui/footer-section";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <GlobalShaderLayout>
      <SEO
        title="Premium Dry Fruits & Healthy Foods"
        description="Shop premium quality dry fruits, nuts, and healthy snacks at Nutriwala. Lab-tested, 100% natural almonds, cashews, walnuts, dates and more. Free shipping on orders above ₹499."
        showOrganization
        url="/"
      />
      <HeroSection />
      <WhyNutriwala />
      <HealthBenefits />
      <ProductHighlights />
      <TestimonialsColumnsSection />
      <NewsletterCTA />
      <Footerdemo />
    </GlobalShaderLayout>
  );
};

export default Index;
