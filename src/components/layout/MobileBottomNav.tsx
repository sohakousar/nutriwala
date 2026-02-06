import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Heart, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/shop", icon: ShoppingBag, label: "Shop" },
  { href: "/account?tab=wishlist", icon: Heart, label: "Wishlist" },
  { href: "/account?tab=orders", icon: Package, label: "Orders" },
  { href: "/account", icon: User, label: "Account" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { openCart, getItemCount } = useCart();
  const { user } = useAuthContext();
  const itemCount = getItemCount();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href.split("?")[0]);
  };

  return (
    <nav className="mobile-nav lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          // If not logged in and accessing account-related pages, redirect to auth
          const href = !user && (item.href.includes("/account"))
            ? "/auth"
            : item.href;

          return (
            <Link
              key={item.href}
              to={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 touch-target transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute bottom-0 h-0.5 w-8 bg-gradient-gold rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
