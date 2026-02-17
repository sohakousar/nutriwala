"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter, Leaf, Phone, Mail, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

function Footerdemo() {
  return (
    <footer className="relative bg-primary text-white border-t border-accent/20">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Newsletter Section */}
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight">
                Nutri<span className="text-accent italic">wala</span>
              </span>
            </Link>
            <p className="mb-6 text-sm text-primary-foreground/80 leading-relaxed">
              Premium dry fruits and healthy foods delivered fresh to your doorstep.
              Experience nature's finest treasures.
            </p>
            <h3 className="mb-3 text-lg font-serif font-semibold text-accent">Stay Connected</h3>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-accent/30 text-white placeholder:text-white/50 focus:border-accent"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-accent text-primary font-bold hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-serif font-semibold text-accent">Quick Links</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Home
              </Link>
              <Link to="/shop" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Shop All
              </Link>
              <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-lg font-serif font-semibold text-accent">Contact Us</h3>
            <address className="space-y-3 text-sm not-italic text-primary-foreground/80">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Kurnool, Andhra Pradesh, India
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                +91 90596 49099
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                nutriwala@gmail.com
              </p>
            </address>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="mb-4 text-lg font-serif font-semibold text-accent">Follow Us</h3>
            <div className="flex gap-3 mb-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-accent/30 bg-transparent text-white hover:bg-accent hover:text-primary hover:border-accent">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-accent/30 bg-transparent text-white hover:bg-accent hover:text-primary hover:border-accent">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>

                    <Button variant="outline" size="icon" className="border-accent/30 bg-transparent text-white hover:bg-accent hover:text-primary hover:border-accent">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-accent/30 bg-transparent text-white hover:bg-accent hover:text-primary hover:border-accent">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs rounded-full bg-accent/20 text-accent border border-accent/30">
                100% Natural
              </span>
              <span className="px-3 py-1 text-xs rounded-full bg-accent/20 text-accent border border-accent/30">
                Lab Tested
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-accent/20 pt-8 text-center md:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Nutriwala. All rights reserved.
          </p>
          <nav className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link to="/shipping" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Shipping Info
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
