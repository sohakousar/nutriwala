import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useAccountData";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface WishlistTabProps {
  userId: string;
}

const WishlistTab = ({ userId }: WishlistTabProps) => {
  const { data: wishlist, isLoading } = useWishlist(userId);
  const removeFromWishlist = useRemoveFromWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist.mutateAsync({ id, userId });
      toast({ title: "Removed from wishlist" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item.",
      });
    }
  };

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-center mb-4">
            Save items you love for later
          </p>
          <Button asChild>
            <Link to="/shop">Explore Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {wishlist.map((item: any, index: number) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <Link to={`/product/${item.products?.slug}`}>
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={item.products?.images?.[0] || "/placeholder.svg"}
                  alt={item.products?.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link to={`/product/${item.products?.slug}`}>
                <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                  {item.products?.name}
                </h3>
              </Link>
              <p className="text-lg font-bold text-primary mt-1">
                ₹{item.products?.price?.toFixed(2)}
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(item.products)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  disabled={removeFromWishlist.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default WishlistTab;
