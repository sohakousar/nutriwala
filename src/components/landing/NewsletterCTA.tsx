import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AdvancedButton } from "@/components/ui/gradient-button";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubscribed(true);
    toast.success("Welcome to Nutriwala! Check your email for a special discount.");
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-white">

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Get 15% Off Your First Order</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 text-primary"
          >
            Start Your{" "}
            <span className="text-accent italic">Healthy Journey</span>{" "}
            Today
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-10"
          >
            Subscribe to our newsletter for exclusive offers, health tips,
            new product launches, and a special 15% discount on your first purchase.
          </motion.p>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-white text-primary border-border focus:border-accent shadow-sm rounded-xl text-base placeholder:text-muted-foreground/60"
                    required
                  />
                </div>
                <AdvancedButton
                  type="submit"
                  disabled={isSubmitting}
                  size="large"
                  className="h-14 bg-primary text-white hover:bg-green-800"
                >
                  {isSubmitting ? (
                    "Subscribing..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Subscribe
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </AdvancedButton>
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-3 bg-accent/10 border border-accent/20 rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-5 w-5 text-accent-foreground" />
                </div>
                <p className="font-semibold text-lg text-primary">You're subscribed! Check your inbox.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Privacy note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-muted-foreground/70 mt-6"
          >
            We respect your privacy. Unsubscribe anytime.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-primary/70"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              Exclusive Offers
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              Health Tips
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              Early Access
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent" />
              Recipe Ideas
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
