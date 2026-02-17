"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon, Leaf, ShoppingBag, User, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const activeTab = items.find(item => item.url === location.pathname)?.name || items[0].name;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop Navigation (Integrated into Header) - This component now only handles Mobile/Tablet floating nav if needed, 
  // but for this redesign, we'll merge it into the main header for desktop and keep it bottom for mobile.
  if (!isMobile) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-white/90 border border-primary/10 backdrop-blur-xl py-1 px-1 rounded-full shadow-lg shadow-primary/5 pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
                "text-muted-foreground hover:text-primary",
                isActive && "text-primary bg-primary/5"
              )}
            >
              <div className="flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              {isActive && (
                <motion.div
                  layoutId="lamp-mobile"
                  className="absolute inset-0 w-full rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Full Header with premium styling
export function TubelightHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, getItemCount } = useCart();
  const { user } = useAuthContext();
  const itemCount = getItemCount();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", url: "/", icon: Leaf },
    { name: "Shop", url: "/shop", icon: ShoppingBag },
    { name: "About", url: "/about", icon: User },
    { name: "Contact", url: "/contact", icon: Leaf },
  ];

  return (
    <>
      {/* Premium Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-nutri-forest via-nutri-gold to-nutri-forest fixed top-0 w-full z-50" />

      {/* Main Header */}
      <header
        className={cn(
          "fixed top-1 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-xl shadow-soft py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-serif font-bold text-primary tracking-tight">
                  Nutri<span className="text-accent italic">wala</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-primary/5 shadow-sm">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive ? "text-primary-foreground bg-primary shadow-md" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-accent hover:bg-primary/5 transition-colors"
                asChild
              >
                <Link to={user ? "/account" : "/auth"}>
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-primary hover:text-accent hover:bg-primary/5 transition-colors"
                onClick={openCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shadow-sm animate-scale-in">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation is used via the separate MobileBottomNav component in Layout */}
    </>
  );
}

export default NavBar;
