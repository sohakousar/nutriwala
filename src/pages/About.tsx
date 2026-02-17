import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Leaf,
  Heart,
  Award,
  Users,
  Target,
  Shield,
  Truck,
  CheckCircle2,
  ArrowRight,
  Quote
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { FeaturesSection } from "@/components/ui/features-section";
import { CategoryList } from "@/components/ui/category-list";

const values = [
  {
    icon: Heart,
    title: "Health First",
    description: "We believe in providing only the purest, most nutritious dry fruits that contribute to your well-being.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every product is carefully sourced from trusted farmers and undergoes rigorous quality testing.",
  },
  {
    icon: Shield,
    title: "100% Natural",
    description: "No preservatives, no additives. Just pure, natural goodness from nature's bounty.",
  },
  {
    icon: Users,
    title: "Customer Love",
    description: "Our customers are family. We're committed to exceeding expectations every single time.",
  },
];

const milestones = [
  { year: "2019", title: "Founded", description: "Started with a vision to bring premium dry fruits to every home" },
  { year: "2020", title: "10K Customers", description: "Reached our first milestone of happy customers" },
  { year: "2021", title: "Subscriptions", description: "Launched weekly and monthly subscription boxes" },
  { year: "2022", title: "50K Orders", description: "Delivered 50,000+ orders across India" },
  { year: "2023", title: "Lab Certified", description: "Achieved ISO and FSSAI certifications" },
  { year: "2024", title: "Pan India", description: "Expanded delivery to all major cities" },
];

const certifications = [
  { name: "FSSAI Certified", description: "Food Safety Standards Authority of India" },
  { name: "ISO 22000", description: "Food Safety Management" },
  { name: "Lab Tested", description: "Third-party quality assurance" },
  { name: "Organic Options", description: "Certified organic selections" },
];

const About = () => {
  return (
    <Layout>
      <SEO
        title="About Us"
        description="Learn about Nutriwala's journey to bring premium, lab-tested dry fruits to your doorstep. Our commitment to quality, health, and customer satisfaction."
        url="/about"
        showOrganization
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
        ]}
      />

      {/* Bento Grid: Story, Mission, Vision, Journey */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <BentoGrid className="max-w-6xl mx-auto">
            <BentoCard
              title="Our Story"
              description="Nutriwala began in 2019 with a singular purpose: to bridge the gap between premium international orchards and Indian households. Witnessing the lack of authentic, high-quality dry fruits in the market, we embarked on a journey to source directly from the best origins—be it Californian almonds or Kashmiri walnuts. What started as a small passion project has now evolved into a movement for healthier snacking across the nation."
              className="lg:col-span-3 lg:row-span-2 bg-gradient-to-br from-white to-soft-cream/50"
            />
            <BentoCard
              title="Our Mission"
              description="Our mission extends beyond just selling products; we aim to revolutionize how India snacks. We are dedicated to providing ethical, fair-trade produce that empowers farmers while ensuring that you receive nothing but the purest nutrition. We strive to eliminate middlemen, ensuring better prices for growers and fresher quality for you."
              className="lg:col-span-3 lg:row-span-1"
            />
            <BentoCard
              title="Our Vision"
              description="We envision a future where 'Nutriwala' is synonymous with trust and vitality. We aspire to build a health-conscious community where nutritious choices are easy and transparent. By continuously innovating in sourcing and sustainability, we aim to set a global benchmark for quality in the dry fruit industry."
              className="lg:col-span-3 lg:row-span-1"
            />
            <BentoCard
              title="Our Journey"
              description="From a humble beginning delivering to friends and family, Nutriwala has grown into a pan-India brand trusted by over 50,000 customers. Navigating through challenges, we achieved critical milestones like ISO 22000 certification and establishing a robust supply chain. Today, we stand proud as a symbol of quality, having delivered purity to over 100 cities, and we are just getting started."
              className="lg:col-span-6 lg:row-span-1 bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Core Values */}
      <FeaturesSection
        title="Our Core Values"
        description="These principles guide everything we do, from sourcing to delivery."
        features={[
          {
            icon: Heart,
            title: "Health First",
            description: "We believe in providing only the purest, most nutritious dry fruits that contribute to your well-being.",
          },
          {
            icon: Award,
            title: "Premium Quality",
            description: "Every product is carefully sourced from trusted farmers and undergoes rigorous quality testing.",
          },
          {
            icon: Shield,
            title: "100% Natural",
            description: "No preservatives, no additives. Just pure, natural goodness from nature's bounty.",
          },
          {
            icon: Users,
            title: "Customer Love",
            description: "Our customers are family. We're committed to exceeding expectations every single time.",
          },
          {
            icon: Truck,
            title: "Fast Delivery",
            description: "Ensuring your healthy snacks reach you fresh and on time, anywhere in India.",
          },
          {
            icon: CheckCircle2,
            title: "Verified Fresh",
            description: "Double-checked for freshness before packing. If it's not fresh, we don't ship it.",
          },
        ]}
      />


      {/* Founder Quote */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/50 shadow-medium relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-16 -mt-16" />
              <Quote className="h-12 w-12 text-accent/20 mx-auto mb-6 relative z-10" />
              <blockquote className="text-xl md:text-2xl font-heading text-primary leading-relaxed mb-6 font-serif italic">
                "We started Nutriwala because we believed everyone deserves access to pure,
                high-quality dry fruits without compromise. Every product we sell carries our
                promise of excellence."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-lg font-bold">RK</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-primary">Rahul Kapoor</p>
                  <p className="text-sm text-muted-foreground">Founder & CEO</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-soft-cream/50">
        <CategoryList
          title="Why Choose"
          subtitle="Nutriwala?"
          headerIcon={<Leaf className="w-8 h-8" />}
          categories={[
            {
              id: 1,
              title: "Premium Global Sourcing",
              subtitle: "We travel the globe to handpick the finest dry fruits directly from certified orchards. From Iranian dates to Californian almonds, we ensure 100% authentic origin and superior quality in every pack.",
              icon: <Truck className="w-10 h-10" />,
            },
            {
              id: 2,
              title: "Lab-Tested Purity",
              subtitle: "Your health is non-negotiable. Every batch undergoes rigorous 3-step quality testing to ensure it is 100% natural, chemical-free, and safe for your family. FSSAI certified and quality assurred.",
              icon: <Shield className="w-10 h-10" />,
            },
            {
              id: 3,
              title: "Farm-to-Fork Freshness",
              subtitle: "Experience the crunch of true freshness. Our advanced airtight packaging technology locks in natural nutrients and flavors immediately after sourcing, delivering farm-fresh goodness to your doorstep.",
              icon: <Heart className="w-10 h-10" />,
            },
          ]}
        />
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              Ready to Experience <span className="text-gradient-gold">Premium Quality?</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of happy customers who trust Nutriwala for their daily nutrition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
                <Link to="/shop" className="gap-2">
                  Explore Our Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-accent/30 hover:bg-accent/10">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
