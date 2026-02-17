import { motion } from "framer-motion";
import { Gallery4, Gallery4Item } from "@/components/ui/gallery4";

const galleryItems: Gallery4Item[] = [
  {
    id: "farm-fresh",
    title: "Farm Fresh Sourcing",
    description:
      "Direct partnerships with trusted farmers from Kashmir, Afghanistan, and California for the freshest produce.",
    href: "/about",
    image:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto/v1770459599/Whisk_027f908fd43ed22bc834cfcfd55001d2dr_zcvu23.jpg",
  },
  {
    id: "natural",
    title: "100% Natural",
    description:
      "No additives, preservatives, or artificial flavoring. Just pure, wholesome goodness.",
    href: "/about",
    image:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto/v1770459597/Whisk_a39f0b18646bf0488944b7de9f080b4adr_rt03jb.jpg",
  },
  {
    id: "fair-trade",
    title: "Fair Trade Practices",
    description:
      "We ensure fair compensation to farmers, supporting sustainable agriculture.",
    href: "/about",
    image:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto/v1770459597/Whisk_92c9fb24634f736a78a4189cd56be817dr_i33bhz.jpg",
  },
  {
    id: "premium",
    title: "Premium Selection",
    description:
      "Hand-picked, grade-A quality dry fruits that meet our exacting standards.",
    href: "/about",
    image:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto/v1770459600/Whisk_bc135a1b2b09fcaa7be401d8ccffed65dr_av2rge.jpg",
  },
  {
    id: "eco-friendly",
    title: "Eco-Friendly Packaging",
    description:
      "Sustainable packaging that keeps products fresh while caring for the planet.",
    href: "/about",
    image:
      "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto/v1770459597/Whisk_65124114d8bd3bcbc2b430bf80aeba53dr_gpmpvi.jpg",
  },
];

const WhyNutriwala = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-white">

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 tracking-wider uppercase">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-primary">
            The <span className="text-accent italic">Nutriwala</span> Promise
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We're committed to bringing you the finest quality dry fruits with complete
            transparency in sourcing and unwavering dedication to your health.
          </p>
        </motion.div>

        {/* Gallery4 Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Gallery4
            title="Our Promise"
            description="Discover what makes Nutriwala the preferred choice for premium dry fruits and healthy snacks."
            items={galleryItems}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default WhyNutriwala;
