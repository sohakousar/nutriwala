import { motion } from "framer-motion";
import { ArrowRight, Leaf, Shield, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-soft-cream">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent skew-x-12 transform origin-top-right -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
            >
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-primary text-sm font-medium tracking-wide uppercase">#1 Premium Nutrition Brand</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 text-primary"
            >
              Elevate Your <br className="hidden lg:block" />
              <span className="text-accent italic">Daily Wellness</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Discover the finest selection of handpicked dry fruits, nuts, and superfoods.
              Sourced directly from nature's best farms to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Start Shopping
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* USP Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start pt-6 border-t border-border"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Leaf className="h-5 w-5 text-green-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-sm">100% Organic</p>
                  <p className="text-xs text-muted-foreground">Certified Sourcing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-sm">Lab Tested</p>
                  <p className="text-xs text-muted-foreground">Quality Assured</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <Award className="h-5 w-5 text-yellow-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-sm">Premium Grade</p>
                  <p className="text-xs text-muted-foreground">Top Tier Selection</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 rotate-3 transition-transform duration-500 hover:rotate-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop"
                alt="Premium Dry Fruits"
                className="w-full h-[600px] object-cover"
              />

              {/* Floating Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 left-8 right-8 z-20 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent font-medium text-sm mb-1">Weekly Best Seller</p>
                    <h3 className="font-serif text-xl font-bold text-primary">Royal Walnut Kernels</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground line-through">₹1,200</p>
                    <p className="text-lg font-bold text-primary">₹899</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background Shape */}
            <div className="absolute top-10 -right-10 w-full h-full border-2 border-accent/20 rounded-[2.5rem] -z-10 rotate-6" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
