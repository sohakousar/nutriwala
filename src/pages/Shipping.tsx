import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const Shipping = () => {
    const shippingInfo = [
        {
            icon: Truck,
            title: "Free Shipping",
            description: "Free delivery on all orders above ₹499",
        },
        {
            icon: Clock,
            title: "Delivery Time",
            description: "2-5 business days across India",
        },
        {
            icon: MapPin,
            title: "Pan India Delivery",
            description: "We deliver to all major cities and towns",
        },
        {
            icon: Package,
            title: "Safe Packaging",
            description: "Premium packaging to ensure freshness",
        },
    ];

    return (
        <Layout>
            <SEO
                title="Shipping Information"
                description="Nutriwala shipping policy - Free delivery on orders above ₹499. Learn about our delivery times and policies."
                url="/shipping"
            />
            <section className="pt-24 sm:pt-32 pb-16 sm:pb-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                                Shipping <span className="text-gradient-yellow">Information</span>
                            </h1>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                We ensure your premium dry fruits reach you fresh and on time.
                            </p>
                        </div>

                        {/* Shipping Highlights */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            {shippingInfo.map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card rounded-xl p-4 text-center"
                                >
                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                                        <item.icon className="h-6 w-6 text-accent" />
                                    </div>
                                    <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detailed Info */}
                        <div className="glass-card rounded-2xl p-6 sm:p-10">
                            <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
                                <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Delivery Charges</h2>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Orders above ₹499: <span className="text-accent font-semibold">FREE SHIPPING</span></li>
                                    <li>Orders below ₹499: ₹49 delivery charge</li>
                                </ul>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Delivery Timeline</h2>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Metro cities (Mumbai, Delhi, Bangalore, etc.): 2-3 business days</li>
                                    <li>Tier 2 cities: 3-4 business days</li>
                                    <li>Other locations: 4-5 business days</li>
                                </ul>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Order Tracking</h2>
                                <p>
                                    Once your order is dispatched, you'll receive a tracking link via SMS and email. You can also track your order from your account dashboard.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Returns & Refunds</h2>
                                <p>
                                    If you receive damaged or stale products, please contact us within 48 hours of delivery with photos. We'll arrange a free replacement or full refund.
                                </p>

                                <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
                                <p>
                                    For shipping queries, reach us at{" "}
                                    <a href="mailto:nutriwala@gmail.com" className="text-accent hover:underline">
                                        nutriwala@gmail.com
                                    </a>{" "}
                                    or call +91 90596 49099
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default Shipping;
