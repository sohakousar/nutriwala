import { useState } from "react";
import { motion } from "framer-motion";
import { ContactCard } from "@/components/ui/contact-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

      {/* FAQ Section */}
      <section className="pt-32 pb-16 bg-soft-cream/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >

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
                  <AccordionTrigger className="text-left hover:no-underline text-primary [&>svg]:hidden">
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

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-soft-cream/30">
        <div className="container mx-auto px-4">
          <ContactCard
            title="Get in Touch"
            description="Have questions about our products, orders, or subscriptions? Our team is here to help you. Fill out the form or reach us directly."
            contactInfo={[
              {
                icon: MapPin,
                label: "Visit Us",
                value: "Kurnool, Andhra Pradesh 518001",
              },
              {
                icon: Phone,
                label: "Call Us",
                value: "+91 90596 49099",
              },
              {
                icon: Mail,
                label: "Email Us",
                value: "nutriwala@gmail.com",
              },
              {
                icon: Clock,
                label: "Business Hours",
                value: "Mon - Sat: 9:00 AM - 7:00 PM",
              },
            ]}
          >
            <div className="w-full">
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
          </ContactCard>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
