import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "👩",
    rating: 5,
    text: "The quality of almonds is exceptional! You can taste the freshness. My family has completely switched to Nutriwala for all our dry fruit needs.",
    product: "California Almonds",
  },
  {
    id: 2,
    name: "Rahul Mehta",
    location: "Delhi",
    avatar: "👨",
    rating: 5,
    text: "I ordered the bulk pack and it's been fantastic. The delivery is always on time, and the products are consistently premium quality.",
    product: "Premium Bulk Pack",
  },
  {
    id: 3,
    name: "Anjali Gupta",
    location: "Bangalore",
    avatar: "👩‍💼",
    rating: 5,
    text: "Ordered the gift hamper for Diwali and it was a huge hit! Beautiful packaging and the taste was absolutely incredible. Will order again!",
    product: "Festive Gift Hamper",
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Pune",
    avatar: "🧔",
    rating: 5,
    text: "As a fitness enthusiast, I need quality protein sources. Nutriwala's mixed nuts are my go-to post-workout snack. Highly recommend!",
    product: "Premium Mixed Nuts",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Customer Love
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
            What Our <span className="text-gradient-gold">Customers</span> Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our happy customers have to say about their Nutriwala experience.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-medium border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-accent/20">
                <Quote className="h-16 w-16" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg md:text-xl leading-relaxed mb-8 relative z-10">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <p className="font-serif font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {testimonials[currentIndex].location} • {testimonials[currentIndex].product}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                      ? "w-8 bg-accent"
                      : "bg-border hover:bg-muted-foreground"
                    }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span className="font-semibold">4.9/5</span>
            <span className="text-sm">Average Rating</span>
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="text-muted-foreground">
            <span className="font-semibold">2,500+</span>
            <span className="text-sm ml-1">Verified Reviews</span>
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="text-muted-foreground">
            <span className="font-semibold">98%</span>
            <span className="text-sm ml-1">Customer Satisfaction</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
