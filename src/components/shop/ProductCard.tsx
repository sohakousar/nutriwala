import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/useAccountData";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlist } = useWishlist(user?.id);

  // Check if product is in wishlist
  const wishlistItem = wishlist?.find(item => item.product_id === product.id);
  const isInWishlist = !!wishlistItem;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Please login",
        description: "You need to be logged in to add items to wishlist",
      });
      return;
    }

    try {
      if (isInWishlist && wishlistItem) {
        await removeFromWishlist.mutateAsync({ id: wishlistItem.id, userId: user.id });
        toast({ title: "Removed from wishlist" });
      } else {
        await addToWishlist.mutateAsync({ userId: user.id, productId: product.id });
        toast({ title: "Added to wishlist", description: `${product.name} has been added to your wishlist` });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update wishlist",
      });
    }
  };

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  // Placeholder images for dry fruits if needed, otherwise use product.images[0]
  const productImages: Record<string, string> = {
    "premium-california-almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=400&fit=crop",
    "kashmiri-walnuts": "https://images.unsplash.com/photo-1563412885-139e4045d8a4?w=400&h=400&fit=crop",
    "jumbo-cashews": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop",
    "medjool-dates": "https://images.unsplash.com/photo-1593904308143-3e5bd8c553c2?w=400&h=400&fit=crop",
    "mixed-dry-fruits-premium": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",
    "weekly-wellness-pack": "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=400&fit=crop",
    "iranian-pistachios": "https://images.unsplash.com/photo-1525706040175-5c0d0d0b3689?w=400&h=400&fit=crop",
    "dried-apricots": "https://images.unsplash.com/photo-1597371424128-8ffb9cb8cb36?w=400&h=400&fit=crop",
  };

  const imageUrl = product.images?.[0] || productImages[product.slug] || "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=400&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 h-full flex flex-col">
        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200 hover:scale-110"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all",
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>

        {/* Image Container */}
        <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 flex-shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discountPercentage > 0 && (
              <Badge className="bg-destructive text-white border-0 text-xs font-semibold px-2 py-0.5">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Quick Actions Overlay (Desktop) */}
          <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 hidden sm:flex z-10">
            <Button
              className="w-full bg-white/95 text-primary hover:bg-primary hover:text-white shadow-soft backdrop-blur-sm mr-2"
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="icon"
              className="bg-white/95 text-gray-600 hover:bg-primary hover:text-white shadow-soft backdrop-blur-sm"
              asChild
            >
              <Link to={`/product/${product.slug}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category */}
          {product.category ? (
            <p className="text-xs text-accent font-medium uppercase tracking-wider mb-2">
              {product.category.name}
            </p>
          ) : (
            <div className="h-4 mb-2"></div>
          )}

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="mb-2">
            <h3 className="font-serif font-bold text-lg text-primary group-hover:text-accent transition-colors line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Spacer to push price to bottom */}
          <div className="mt-auto">
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-foreground">
                ₹{product.price.toFixed(0)}
              </span>
              {product.compare_at_price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.compare_at_price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Mobile Add to Cart (Always visible) */}
            <Button
              className="w-full sm:hidden bg-primary text-white hover:bg-primary/90"
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
