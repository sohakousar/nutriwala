import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

import { useProducts, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const ProductHighlights = () => {
  // Fetch all products to perform client-side random selection from categories
  const { data: allProducts, isLoading: productsLoading } = useProducts({});
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Logic to select random products from each category
  const products = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    // Group by category
    const productsByCategory: Record<string, typeof allProducts> = {};
    allProducts.forEach((p) => {
      const catId = p.category_id || "uncategorized";
      if (!productsByCategory[catId]) productsByCategory[catId] = [];
      productsByCategory[catId].push(p);
    });

    // Select one random product from each category to ensure variety
    const selectedProducts: typeof allProducts = [];
    const categoryIds = Object.keys(productsByCategory);

    // First pass: 1 from each category
    categoryIds.forEach(catId => {
      const catProducts = productsByCategory[catId];
      if (catProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * catProducts.length);
        const selected = catProducts[randomIndex];
        selectedProducts.push(selected);
        // Remove selected from pool
        productsByCategory[catId] = catProducts.filter(p => p.id !== selected.id);
      }
    });

    // Second pass: Fill the rest up to 6 items randomly from remaining pool
    const remainingProducts = Object.values(productsByCategory).flat();
    while (selectedProducts.length < 6 && remainingProducts.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingProducts.length);
      selectedProducts.push(remainingProducts[randomIndex]);
      remainingProducts.splice(randomIndex, 1);
    }

    // derived shuffle function for final display
    return selectedProducts.sort(() => Math.random() - 0.5);
  }, [allProducts]);

  // Category image map
  const categoryImages: Record<string, string> = {
    "daily-essentials": "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770469984/Whisk_3b9448972a158da9e1d47057f376fbe5dr_w48iag.png",
    "gift-hampers": "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770469999/Whisk_de99e1d71cc7897a7a542a2bd85775ccdr_qleemb.png",
    "premium-combos": "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770470108/Whisk_472803d52106b4c826244d490e0fb26fdr_tux9y3.png",
    "festive-specials": "https://res.cloudinary.com/dzl8kzfcj/image/upload/f_auto,q_auto,w_1200,h_800,c_fill,g_auto/v1770470485/Whisk_f04f1be14d752ff98f1470411ac1a612dr_jksej0.png",
  };

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-white">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4 tracking-wider uppercase">
              Featured Products
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary">
              Our <span className="text-accent italic">Best Sellers</span>
            </h2>
          </div>
          <Button asChild variant="outline" className="self-start md:self-auto border-accent/30 text-primary hover:bg-accent/10 hover:text-accent">
            <Link to="/shop">View All Products</Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products?.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-6 rounded-2xl bg-white shadow-sm border border-border/50 hover:shadow-md hover:border-accent/30 transition-all duration-300 h-full flex flex-col">
                  {/* Badge */}
                  {product.compare_at_price && product.price < product.compare_at_price && (
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold">
                      Sale
                    </Badge>
                  )}

                  {/* Product Image */}
                  <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-soft-cream transition-colors overflow-hidden">
                    {product.images?.[0] ? (
                      <motion.img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <span className="text-6xl">🌰</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3 mt-auto">
                    {/* Rating (Placeholder for now as DB doesn't aggregate ratings easily in list view efficiently without join, or use fetched rating if available) */}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm font-medium text-primary">4.8</span>
                      <span className="text-sm text-muted-foreground">
                        (120+ reviews)
                      </span>
                    </div>

                    {/* Name */}
                    <Link to={`/product/${product.slug}`} className="block">
                      <h3 className="text-lg font-serif font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary">
                        ₹{product.price}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.compare_at_price}
                        </span>
                      )}
                      {product.compare_at_price && (
                        <Badge variant="secondary" className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border-none">
                          {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Shop Button */}
                    <Button asChild className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
                      <Link to={`/product/${product.slug}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Categories Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-xl font-serif font-semibold mb-6 text-center text-primary">Shop by Category</h3>
          {categoriesLoading ? (
            <div className="text-center text-muted-foreground">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {categories?.slice(0, 4).map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -3 }}
                  className="cursor-pointer w-full max-w-[200px]"
                >
                  <Link
                    to={`/category/${category.slug}`}
                    className="block p-4 rounded-xl bg-white shadow-sm border border-border/50 hover:shadow-md hover:border-accent/40 text-center transition-all duration-300 h-full"
                  >
                    <div className="mb-3 h-32 w-full flex items-center justify-center overflow-hidden rounded-lg">
                      {categoryImages[category.slug] ? (
                        <img
                          src={categoryImages[category.slug]}
                          alt={category.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <p className="font-medium text-sm text-primary line-clamp-1">{category.name}</p>
                    <p className="text-xs text-muted-foreground">View Collection</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductHighlights;
