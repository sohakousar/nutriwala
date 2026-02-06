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

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
              <Leaf className="h-3 w-3 mr-1" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Bringing Nature's Finest to Your <span className="text-gradient-gold">Doorstep</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Nutriwala, we're on a mission to make premium, healthy dry fruits accessible to everyone.
              Our journey began with a simple belief: quality should never be compromised.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 h-full border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide every Indian household with access to premium, lab-tested dry fruits
                  that are sourced directly from farmers, ensuring fair trade and the highest quality
                  standards while promoting a healthier lifestyle.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 h-full border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become India's most trusted destination for premium dry fruits and healthy snacks,
                  fostering a community that values nutrition, quality, and sustainable sourcing practices.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-soft-cream/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Our Core <span className="text-accent italic">Values</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from sourcing to delivery.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-6 h-full text-center border border-border/50 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2 text-primary">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Our <span className="text-accent italic">Journey</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From a small startup to a trusted brand, here's how we've grown.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-lg mb-3">
                    {milestone.year.slice(2)}
                  </div>
                  <h3 className="font-semibold mb-1 text-primary">{milestone.title}</h3>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-soft-cream/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Quality <span className="text-accent italic">Certifications</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality is backed by industry-leading certifications.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 flex items-start gap-3 border border-border/50 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-primary">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
                Why Choose <span className="text-accent italic">Nutriwala?</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2 text-primary">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On all orders above ₹499</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2 text-primary">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">100% satisfaction or money back</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2 text-primary">Fresh Always</h3>
                <p className="text-sm text-muted-foreground">Packed fresh for every order</p>
              </motion.div>
            </div>
          </div>
        </div>
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
