import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

const Terms = () => {
    return (
        <Layout>
            <SEO
                title="Terms of Service"
                description="Nutriwala's Terms of Service - Read our terms and conditions for using our services."
                url="/terms"
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
                                Terms of <span className="text-gradient-yellow">Service</span>
                            </h1>

                            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                                <p>
                                    Welcome to Nutriwala. By using our website and services, you agree to these terms and conditions.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Use of Service</h2>
                                <p>
                                    You must be at least 18 years old to use our services. By placing an order, you represent that you are of legal age and have the capacity to enter into a binding contract.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Orders and Payment</h2>
                                <p>
                                    All orders are subject to acceptance and availability. Prices are subject to change without notice. We accept major credit cards, debit cards, and UPI payments.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Product Quality</h2>
                                <p>
                                    We guarantee the quality and freshness of all our products. If you receive a product that doesn't meet our quality standards, please contact us within 48 hours of delivery for a replacement or refund.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Limitation of Liability</h2>
                                <p>
                                    Nutriwala shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
                                <p>
                                    For questions about these Terms, contact us at{" "}
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

export default Terms;
