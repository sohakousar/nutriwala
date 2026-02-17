import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCcw,
  Leaf,
  MapPin,
  Star,
  Check
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/shop/ProductCard";
import { useProduct, useRelatedProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "@/hooks/useAccountData";
import { useToast } from "@/hooks/use-toast";
import { useProductReviews, useAddReview } from "@/hooks/useReviews";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Placeholder images for products
const productImages: Record<string, string[]> = {
  "premium-california-almonds": [
    "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1574570068755-09aa3ec844c2?w=800&h=800&fit=crop",
  ],
  "kashmiri-walnuts": [
    "https://images.unsplash.com/photo-1563412885-139e4045d8a4?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=800&h=800&fit=crop",
  ],
  "jumbo-cashews": [
    "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&h=800&fit=crop",
  ],
  "medjool-dates": [
    "https://images.unsplash.com/photo-1593904308143-3e5bd8c553c2?w=800&h=800&fit=crop",
  ],
  "mixed-dry-fruits-premium": [
    "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop",
  ],
  "weekly-wellness-pack": [
    "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&h=800&fit=crop",
  ],
  "iranian-pistachios": [
    "https://images.unsplash.com/photo-1525706040175-5c0d0d0b3689?w=800&h=800&fit=crop",
  ],
  "dried-apricots": [
    "https://images.unsplash.com/photo-1597371424128-8ffb9cb8cb36?w=800&h=800&fit=crop",
  ],
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: relatedProducts } = useRelatedProducts(
    product?.id || "",
    product?.category_id || null
  );
  const { addItem } = useCart();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlist } = useWishlist(user?.id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: reviews } = useProductReviews(product?.id);
  const addReview = useAddReview();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Check if product is in wishlist
  const wishlistItem = wishlist?.find(item => item.product_id === product?.id);
  const isWishlisted = !!wishlistItem;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) {
      toast({
        variant: "destructive",
        title: "Please login",
        description: "You need to be logged in to submit a review",
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview.mutateAsync({
        product_id: product.id,
        user_id: user.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      toast({ title: "Review submitted successfully!" });
      setIsReviewFormOpen(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting review",
        description: error.message,
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getNutrition = () => {
    const defaultNutrition = {
      energy: "N/A",
      protein: "N/A",
      total_fat: "N/A",
      carbohydrates: "N/A",
      dietary_fiber: "N/A",
    };
    if (product?.nutrition_facts && typeof product.nutrition_facts === 'object') {
      return { ...defaultNutrition, ...(product.nutrition_facts as any) };
    }
    return defaultNutrition;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, false);
  };

  const handleWishlistClick = async () => {
    if (!product) return;

    if (!user) {
      toast({
        variant: "destructive",
        title: "Please login",
        description: "You need to be logged in to add items to wishlist",
      });
      return;
    }

    try {
      if (isWishlisted && wishlistItem) {
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : productImages[product.slug] || ["https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&h=800&fit=crop"];

  const discountPercentage = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQuantity = () => setQuantity((q) => Math.min(10, q + 1));

  return (
    <Layout>
      <SEO
        title={product.name}
        description={product.short_description || product.description || `Buy premium ${product.name} online at Nutriwala. 100% natural, lab-tested, and delivered fresh.`}
        url={`/product/${product.slug}`}
        type="product"
        image={images[0]}
        product={{
          name: product.name,
          description: product.short_description || product.description || "",
          price: product.price,
          currency: "INR",
          availability: product.stock && product.stock > 0 ? "InStock" : "OutOfStock",
          sku: product.sku || product.id,
          brand: "Nutriwala",
          image: images[0],
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          ...(product.category ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : []),
          { name: product.name, url: `/product/${product.slug}` },
        ]}
      />
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 pt-24 sm:pt-32 pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
            <Link to="/shop" className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Shop
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  to={`/category/${product.category.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-primary font-medium truncate">{product.name}</span>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border border-border/50 shadow-sm">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-6 left-6 bg-destructive text-white border-none font-bold text-sm px-3 py-1.5 shadow-md">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Category & Title */}
              <div>
                {product.category && (
                  <Link
                    to={`/category/${product.category.slug}`}
                    className="text-sm text-accent font-bold uppercase tracking-widest hover:text-primary transition-colors mb-2 block"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mt-2">
                  {product.name}
                </h1>
                {product.origin && (
                  <p className="flex items-center gap-1 text-muted-foreground mt-3 text-sm">
                    <MapPin className="h-4 w-4" />
                    Origin: {product.origin}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 border-b border-border/50 pb-6">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price.toFixed(0)}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through decoration-1">
                    ₹{product.compare_at_price.toFixed(0)}
                  </span>
                )}
                {product.weight_grams && (
                  <Badge variant="outline" className="text-muted-foreground border-border ml-auto">
                    {product.weight_grams}g Pack
                  </Badge>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Health Benefits */}
              {product.health_benefits && product.health_benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.health_benefits.map((benefit) => (
                    <Badge key={benefit} className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 gap-1.5 px-3 py-1.5">
                      <Leaf className="h-3.5 w-3.5" />
                      {benefit}
                    </Badge>
                  ))}
                </div>
              )}



              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center border border-border rounded-xl bg-white shadow-sm w-max">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-12 w-12 rounded-r-none hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                    className="h-12 w-12 rounded-l-none hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1 h-14 text-base gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl" onClick={handleAddToCart}>
                    <ShoppingBag className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-14 w-14 rounded-xl border-border hover:bg-gray-50 flex-shrink-0 ${isWishlisted ? 'text-red-500 bg-red-50' : 'hover:text-red-500'}`}
                    onClick={handleWishlistClick}
                  >
                    <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-border/50">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-primary">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-primary">Quality Assured</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <RefreshCcw className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-primary">Easy Returns</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <div className="mt-20">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent pb-4 px-2 text-lg font-serif text-muted-foreground"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent pb-4 px-2 text-lg font-serif text-muted-foreground"
                >
                  Nutrition Facts
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent pb-4 px-2 text-lg font-serif text-muted-foreground"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-8">
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p className="leading-relaxed">
                    {product.description || product.short_description}
                  </p>
                  {product.health_benefits && product.health_benefits.length > 0 && (
                    <div className="mt-8 bg-soft-cream p-8 rounded-2xl border border-accent/10">
                      <h3 className="text-2xl font-serif font-bold text-primary mb-6">Why Choose This?</h3>
                      <ul className="grid sm:grid-cols-2 gap-4">
                        {product.health_benefits.map((benefit) => (
                          <li key={benefit} className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Check className="h-3.5 w-3.5 text-green-700" />
                            </div>
                            <span className="font-medium text-primary">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="pt-8">
                <div className="max-w-xl bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="text-xl font-serif font-semibold mb-2">Nutrition Information</h3>
                  <p className="text-sm text-muted-foreground mb-6">Per 100g serving</p>
                  <div className="space-y-4">
                    {[
                      { label: "Energy", value: getNutrition().energy },
                      { label: "Protein", value: getNutrition().protein },
                      { label: "Total Fat", value: getNutrition().total_fat },
                      { label: "Carbohydrates", value: getNutrition().carbohydrates },
                      { label: "Dietary Fiber", value: getNutrition().dietary_fiber },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-3 border-b border-dashed border-border last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-8">
                {/* Reviews Summary */}
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-primary">Customer Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${reviews && reviews.length > 0
                            ? (star <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "fill-current" : "")
                            : "text-gray-300"
                            }`} />
                        ))}
                      </div>
                      <span className="text-muted-foreground">
                        ({reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </div>
                  {!isReviewFormOpen && (
                    <Button onClick={() => setIsReviewFormOpen(true)}>Write a Review</Button>
                  )}
                </div>

                {/* Review Form */}
                {isReviewFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 bg-gray-50 p-6 rounded-2xl border border-border"
                  >
                    <h4 className="font-bold text-lg mb-4">Write your review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${star <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Transformative product!"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="comment">Review</Label>
                        <Textarea
                          id="comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience..."
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmittingReview}>
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsReviewFormOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={review.user_profile?.avatar_url || ""} />
                              <AvatarFallback>{review.user_profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{review.user_profile?.full_name || "Verified Customer"}</div>
                              <div className="text-xs text-muted-foreground mr-2">
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex text-yellow-500">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-bold mb-2">{review.title}</h5>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section className="mt-24 border-t border-border pt-16">
              <h2 className="text-3xl font-serif font-bold text-primary mb-10 text-center">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
