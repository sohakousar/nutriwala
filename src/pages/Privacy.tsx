import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

const Privacy = () => {
    return (
        <Layout>
            <SEO
                title="Privacy Policy"
                description="Nutriwala's Privacy Policy - Learn how we protect your personal information and data."
                url="/privacy"
            />
            <section className="pt-24 sm:pt-32 pb-16 sm:pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="glass-card rounded-2xl p-6 sm:p-10">
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-6">
                                Privacy <span className="text-gradient-Yellow">Policy</span>
                            </h1>

                            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                                <p>
                                    At Nutriwala, we are committed to protecting your privacy and ensuring the security of your personal information.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
                                <p>
                                    We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include your name, email address, phone number, shipping address, and payment information.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">How We Use Your Information</h2>
                                <p>
                                    We use the information we collect to process your orders, communicate with you about your purchases, improve our services, and send you promotional offers (with your consent).
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Data Security</h2>
                                <p>
                                    We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
                                <p>
                                    If you have any questions about our Privacy Policy, please contact us at{" "}
                                    <a href="mailto:nutriwala@gmail.com" className="text-accent hover:underline">
                                        nutriwala@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default Privacy;
