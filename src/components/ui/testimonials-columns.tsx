"use client";
import React from "react";
import { motion } from "framer-motion";

interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
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
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div
                  key={`${name}-${i}`}
                  className="p-6 rounded-2xl bg-white shadow-sm border border-border/50 max-w-xs hover:shadow-md hover:border-accent/30 transition-all duration-300"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{text}</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={image}
                      alt={name}
                      className="w-10 h-10 rounded-full border-2 border-accent/20"
                    />
                    <div>
                      <p className="font-serif font-semibold text-sm text-primary">{name}</p>
                      <p className="text-xs text-muted-foreground">{role}</p>
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
    text: "The quality of almonds is exceptional! You can taste the freshness. My family has completely switched to Nutriwala for all our dry fruit needs.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Priya Sharma",
    role: "Mumbai",
  },
  {
    text: "I subscribed to the monthly pack and it's been fantastic. The delivery is always on time, and the products are consistently premium quality.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Rahul Mehta",
    role: "Delhi",
  },
  {
    text: "Ordered the gift hamper for Diwali and it was a huge hit! Beautiful packaging and the taste was absolutely incredible. Will order again!",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Anjali Gupta",
    role: "Bangalore",
  },
  {
    text: "As a fitness enthusiast, I need quality protein sources. Nutriwala's mixed nuts are my go-to post-workout snack. Highly recommend!",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Vikram Singh",
    role: "Pune",
  },
  {
    text: "The cashews are the best I've ever had. Crunchy, fresh, and perfectly roasted. Customer service is also excellent!",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Sneha Patel",
    role: "Ahmedabad",
  },
  {
    text: "Love the variety pack! Great way to try different dry fruits. The dates and figs are particularly amazing.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Meera Krishnan",
    role: "Chennai",
  },
  {
    text: "Perfect for corporate gifting. We ordered 50 hampers and every single one was beautifully packed. Our clients loved them!",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Arjun Reddy",
    role: "Hyderabad",
  },
  {
    text: "The subscription service is a game-changer. Never run out of healthy snacks now. Highly recommend the premium walnuts!",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Kavitha Nair",
    role: "Kochi",
  },
  {
    text: "Excellent quality and fast delivery. The pistachios are so fresh and flavorful. Will definitely be a repeat customer!",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Rohit Agarwal",
    role: "Kolkata",
  },
];

export default TestimonialsColumn;
