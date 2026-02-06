import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Headphones,
  FileQuestion
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["123 Wellness Street", "Andheri West", "Mumbai, Maharashtra 400058"],
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91 98765 43210", "+91 22 2849 0000"],
  },
  {
    icon: Mail,
    title: "Email Us",
    lines: ["hello@nutriwala.com", "support@nutriwala.com"],
  },
  {
    icon: Clock,
    title: "Business Hours",
    lines: ["Mon - Sat: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 4:00 PM"],
  },
];

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for unopened products. If you're not satisfied with your purchase, please contact us within 7 days of delivery for a full refund or replacement.",
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3-5 business days for metro cities and 5-7 business days for other locations. Express delivery is available for select pin codes.",
  },
  {
    question: "Are your products organic?",
    answer: "We offer both conventional and certified organic options. Products with organic certification are clearly labeled on our website and packaging.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive an email and SMS with tracking details. You can also track your order from your account dashboard.",
  },
  {
    question: "Do you offer bulk or corporate orders?",
    answer: "Yes! We offer special pricing for bulk and corporate orders. Please contact us at corporate@nutriwala.com for custom quotes.",
  },
  {
    question: "How do subscriptions work?",
    answer: "Our subscription plans deliver fresh dry fruits to your doorstep weekly, bi-weekly, or monthly. You can pause, modify, or cancel anytime from your account.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Contact form submitted:", data);

    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you within 24 hours.",
    });

    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Get in touch with Nutriwala. We're here to help with orders, inquiries, or feedback. Contact us via phone, email, or our contact form."
        url="/contact"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact Us", url: "/contact" },
        ]}
        faqs={faqs}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-soft-cream/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <MessageSquare className="h-3 w-3 mr-1" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
              We'd Love to <span className="text-accent italic">Hear From You</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about our products, orders, or subscriptions?
              Our team is here to help you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl p-6 h-full text-center border border-border/50 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2 text-primary">{info.title}</h3>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Send className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-heading font-semibold text-primary">Send Us a Message</h2>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary">Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" className="bg-background border-input text-primary placeholder:text-muted-foreground/50 focus:border-accent" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary">Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" className="bg-background border-input text-primary placeholder:text-muted-foreground/50 focus:border-accent" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary">Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 98765 43210" className="bg-background border-input text-primary placeholder:text-muted-foreground/50 focus:border-accent" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-primary">Subject *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background border-input text-primary focus:border-accent">
                                  <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="order">Order Inquiry</SelectItem>
                                <SelectItem value="product">Product Question</SelectItem>
                                <SelectItem value="subscription">Subscription Help</SelectItem>
                                <SelectItem value="bulk">Bulk/Corporate Order</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary">Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="How can we help you?"
                              className="min-h-[120px] resize-none bg-background border-input text-primary placeholder:text-muted-foreground/50 focus:border-accent"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-primary text-white hover:bg-green-800" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              {/* Map */}
              <div className="bg-white rounded-2xl p-8 flex-1 min-h-[300px] flex items-center justify-center border border-border/50 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-soft-cream/30 group-hover:bg-soft-cream/50 transition-colors" />
                <div className="text-center relative z-10">
                  <MapPin className="h-12 w-12 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-1 text-primary">Visit Our Store</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Wellness Street, Andheri West
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mumbai, Maharashtra 400058
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 border-accent/30 text-primary hover:bg-accent/10" asChild>
                    <a
                      href="https://maps.google.com/?q=Andheri+West+Mumbai"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Maps
                    </a>
                  </Button>
                </div>
              </div>

              {/* Quick Contact Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 text-center border border-border/50 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 cursor-pointer">
                  <Headphones className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1 text-primary">Call Support</h3>
                  <a href="tel:+919876543210" className="text-sm text-accent hover:underline">
                    +91 98765 43210
                  </a>
                </div>
                <div className="bg-white rounded-xl p-6 text-center border border-border/50 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 cursor-pointer">
                  <Mail className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1 text-primary">Email Us</h3>
                  <a href="mailto:hello@nutriwala.com" className="text-sm text-accent hover:underline">
                    hello@nutriwala.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-soft-cream/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              <FileQuestion className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Frequently Asked <span className="text-accent italic">Questions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions about our products and services.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-xl px-6 border-border/50 shadow-sm data-[state=open]:border-accent/30 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left hover:no-underline text-primary">
                    <span className="font-medium text-lg">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
