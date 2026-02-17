import React from "react";
import { motion } from "framer-motion";
import { TestimonialsColumn, nutriwalaTestimonials } from "@/components/ui/testimonials-columns";

const firstColumn = nutriwalaTestimonials.slice(0, 5);
const secondColumn = nutriwalaTestimonials.slice(5, 10);
const thirdColumn = nutriwalaTestimonials.slice(10, 16);

const TestimonialsColumnsSection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-soft-cream">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-primary">
            What Our <span className="text-accent italic">Customers</span> Say
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See what our happy customers have to say about their Nutriwala experience.
          </p>
        </motion.div>

        {/* Testimonials Columns */}
        <div className="flex justify-center gap-6 max-h-[600px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <TestimonialsColumn
            testimonials={firstColumn}
            duration={15}
            className="hidden md:block"
          />
          <TestimonialsColumn
            testimonials={secondColumn}
            duration={18}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={20}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsColumnsSection;
