"use client";
import React from "react";
import { motion } from "framer-motion";

import { Star } from "lucide-react";

interface Testimonial {
  text: string;
  name: string;
  location: string;
  product: string;
  rating: number;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 15,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, name, location, product, rating }, i) => (
                <div
                  key={`${name}-${i}`}
                  className="p-6 rounded-2xl bg-white shadow-sm border border-border/50 max-w-xs hover:shadow-md hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (rating || 5) ? "fill-accent text-accent" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent shrink-0">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-sm text-primary">{name}</p>
                      <p className="text-xs text-muted-foreground">{location}</p>
                      <p className="text-[10px] text-accent font-medium mt-0.5">{product}</p>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

// Sample testimonials data for Nutriwala
export const nutriwalaTestimonials: Testimonial[] = [
  {
    name: "Ayesha Khan",
    location: "Kurnool",
    product: "Iranian Premium Dates",
    text: "The dates are really fresh and soft. We ordered them for daily use in Ramzan and the quality was much better than local stores.",
    rating: 5,
  },
  {
    name: "Ravi Teja",
    location: "Hyderabad",
    product: "NutriPouch – Daily Nutrition Pack",
    text: "NutriPouch is very convenient for office. It keeps me full and energetic till evening without junk snacks.",
    rating: 5,
  },
  {
    name: "Mohammed Sameer",
    location: "Nandyal",
    product: "Dry Fruit Laddoo Gift Box",
    text: "Ordered dry fruit laddoo box for a family function. Everyone asked where we bought it from.",
    rating: 5,
  },
  {
    name: "Suma Reddy",
    location: "Dhone",
    product: "Chocolate Makhana",
    text: "Chocolate makhana tastes good and is not too sweet. A nice alternative to regular snacks.",
    rating: 4,
  },
  {
    name: "Abdul Rahman",
    location: "Gadwal",
    product: "Pure Desi Ghee",
    text: "Pure ghee quality is excellent. The aroma feels traditional and authentic.",
    rating: 5,
  },
  {
    name: "Lakshmi Devi",
    location: "Kurnool",
    product: "Mixed Dry Fruits",
    text: "Mixed dry fruits are clean and well packed. No broken pieces, very satisfied.",
    rating: 5,
  },
  {
    name: "Imran Ali",
    location: "Hyderabad",
    product: "NutriPouch Gift Hamper",
    text: "Ordered NutriPouch gift hamper for relatives. Packaging was neat and delivery was on time.",
    rating: 5,
  },
  {
    name: "Suresh Kumar",
    location: "Nandyal",
    product: "Jaggery Sesame Makhana",
    text: "Jaggery sesame makhana tastes natural and light. Perfect for evening tea.",
    rating: 4,
  },
  {
    name: "Padmaja Rao",
    location: "Gadwal",
    product: "Premium Dates",
    text: "Dates are soft and fresh. My parents liked them a lot for daily morning use.",
    rating: 5,
  },
  {
    name: "Farooq Ahmed",
    location: "Kurnool",
    product: "NutriPouch – Daily Nutrition Pack",
    text: "I regularly order NutriPouch for work days. Easy to carry and very filling.",
    rating: 5,
  },
  {
    name: "Syed Ibrahim",
    location: "Hyderabad",
    product: "Ramadan Premium Dates Pack",
    text: "Ordered Ramzan dates pack. Dates stayed fresh till the last day of fasting.",
    rating: 5,
  },
  {
    name: "Harsha Vardhan",
    location: "Nandyal",
    product: "Mixed Dry Fruits",
    text: "Dry fruits are well sorted and clean. Worth the price.",
    rating: 4,
  },
  {
    name: "Nazneen Begum",
    location: "Dhone",
    product: "NutriPouch Gift Hamper",
    text: "Bought this as a gift for relatives. Everyone appreciated the healthy option.",
    rating: 5,
  },
  {
    name: "Kiran Kumar",
    location: "Kurnool",
    product: "Pure Desi Ghee",
    text: "Using this ghee daily for cooking and pooja. Quality feels genuine.",
    rating: 5,
  },
  {
    name: "Asma Parveen",
    location: "Hyderabad",
    product: "Chocolate Makhana",
    text: "Light and not overly sweet. Good snack when craving something at night.",
    rating: 4,
  },
  {
    name: "Ramesh Naidu",
    location: "Gadwal",
    product: "Dry Fruit Laddoo Gift Box",
    text: "Dry fruit laddoos are tasty and not oily. Ordered twice already.",
    rating: 5,
  }
];

export default TestimonialsColumn;
