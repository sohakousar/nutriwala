import { motion } from "framer-motion";
import { ArrowRight, Leaf, Shield, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-20 pb-12 lg:pt-24 lg:pb-20 overflow-hidden bg-soft-cream">
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-b lg:bg-gradient-to-l from-accent/5 to-transparent skew-y-12 lg:skew-x-12 transform origin-top-right -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left mt-8 lg:mt-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white border border-border shadow-sm mb-4 lg:mb-6"
            >
              <Star className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-accent fill-accent" />
              <span className="text-primary text-xs lg:text-sm font-medium tracking-wide uppercase">#1 Premium Nutrition Brand</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold leading-tight mb-4 lg:mb-6 text-primary"
            >
              Elevate Your <br className="hidden lg:block" />
              <span className="text-accent italic">Daily Wellness</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0"
            >
              Discover the finest selection of handpicked dry fruits, nuts, and superfoods.
              Sourced directly from nature's best farms to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-12"
            >
              <Link to="/shop" className="w-full sm:w-auto">
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
              className="flex flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start pt-6 border-t border-border"
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-full bg-green-100">
                  <Leaf className="h-4 w-4 lg:h-5 lg:w-5 text-green-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-xs lg:text-sm">100% Organic</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Certified Sourcing</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-full bg-blue-100">
                  <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-xs lg:text-sm">Lab Tested</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Quality Assured</p>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="p-1.5 lg:p-2 rounded-full bg-yellow-100">
                  <Award className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary text-xs lg:text-sm">Premium Grade</p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Top Tier Selection</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative w-full max-w-md mx-auto lg:max-w-none lg:block"
          >
            <div className="relative z-10 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 rotate-0 lg:rotate-3 transition-transform duration-500 hover:rotate-0 lg:hover:rotate-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <img
                src="https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770463105/Whisk_7994e181c76af92be424790996006f83dr_dvp5md.png"
                alt="Premium Dry Fruits"
                className="w-full h-[350px] sm:h-[450px] lg:h-[600px] object-cover"
              />

              {/* Floating Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8 z-20 bg-white/95 backdrop-blur-md p-4 lg:p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-accent font-medium text-xs lg:text-sm mb-0.5 lg:mb-1">Weekly Best Seller</p>
                    <h3 className="font-serif text-lg lg:text-xl font-bold text-primary">Nutriwala Nutri Pack</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs lg:text-sm text-muted-foreground line-through">₹1,900</p>
                    <p className="text-base lg:text-lg font-bold text-primary">₹1,350</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Background Shape */}
            <div className="absolute top-6 -right-6 lg:top-10 lg:-right-10 w-full h-full border-2 border-accent/20 rounded-[2rem] lg:rounded-[2.5rem] -z-10 rotate-3 lg:rotate-6 hidden sm:block" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
