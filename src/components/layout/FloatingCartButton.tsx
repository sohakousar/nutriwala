import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const FloatingCartButton = () => {
  const { openCart, getItemCount, getTotal } = useCart();
  const itemCount = getItemCount();
  const cartTotal = getTotal();

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40 lg:hidden"
      >
        <Button
          onClick={openCart}
          className={cn(
            "w-full h-14 rounded-2xl shadow-medium",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "flex items-center justify-between px-6"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </div>
            <span className="font-semibold">View Cart</span>
          </div>
          <span className="font-bold">₹{cartTotal.toLocaleString()}</span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCartButton;
