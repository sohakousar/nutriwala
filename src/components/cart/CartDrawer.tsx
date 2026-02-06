import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

// Placeholder images
const productImages: Record<string, string> = {
  "premium-california-almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=100&h=100&fit=crop",
  "kashmiri-walnuts": "https://images.unsplash.com/photo-1563412885-139e4045d8a4?w=100&h=100&fit=crop",
  "jumbo-cashews": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop",
  "medjool-dates": "https://images.unsplash.com/photo-1593904308143-3e5bd8c553c2?w=100&h=100&fit=crop",
  "mixed-dry-fruits-premium": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&h=100&fit=crop",
  "weekly-wellness-pack": "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=100&h=100&fit=crop",
  "iranian-pistachios": "https://images.unsplash.com/photo-1525706040175-5c0d0d0b3689?w=100&h=100&fit=crop",
  "dried-apricots": "https://images.unsplash.com/photo-1597371424128-8ffb9cb8cb36?w=100&h=100&fit=crop",
};

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getItemCount,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="space-y-0 p-4 sm:p-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center justify-between font-serif">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart
              {getItemCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getItemCount()} items
                </Badge>
              )}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6">
            <ShoppingBag className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-base sm:text-lg font-serif font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Add some delicious dry fruits to get started!
            </p>
            <Button onClick={closeCart} asChild className="touch-target">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6 space-y-3 sm:space-y-4 scrollbar-hide">
              <AnimatePresence>
                {items.map((item) => {
                  const imageUrl = item.product.images?.[0] ||
                    productImages[item.product.slug] ||
                    "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=100&h=100&fit=crop";

                  const itemPrice = item.isSubscription
                    ? item.product.price * 0.9
                    : item.product.price;

                  return (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 sm:gap-4 p-3 rounded-lg bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="flex-shrink-0"
                      >
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-medium text-sm sm:text-base text-foreground hover:text-primary line-clamp-2"
                        >
                          {item.product.name}
                        </Link>

                        {item.isSubscription && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Subscribe & Save 10%
                          </Badge>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-r-none touch-target"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-l-none touch-target"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-sm sm:text-base text-foreground">
                              ₹{(itemPrice * item.quantity).toFixed(0)}
                            </p>
                            {item.isSubscription && (
                              <p className="text-xs text-muted-foreground line-through">
                                ₹{(item.product.price * item.quantity).toFixed(0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Coupon Section */}
            <div className="py-4 px-4 sm:px-6 border-t border-border">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">{appliedCoupon}</span>
                    <span className="text-sm text-muted-foreground">applied</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Apply
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-sm text-destructive mt-2">{couponError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Try: WELCOME10 or HEALTHY20
              </p>
            </div>

            {/* Summary */}
            <div className="py-4 px-4 sm:px-6 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{getSubtotal().toFixed(0)}</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount</span>
                  <span>-₹{getDiscountAmount().toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base sm:text-lg">
                <span>Total</span>
                <span>₹{getTotal().toFixed(0)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="p-4 sm:p-6 pt-0 safe-bottom">
              <Button
                size="lg"
                className="w-full gap-2 touch-target"
                onClick={closeCart}
                asChild
              >
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
