import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Placeholder product data
const products = [
  {
    id: 1,
    name: "California Almonds",
    price: 599,
    originalPrice: 749,
    rating: 4.9,
    reviews: 245,
    image: "🌰",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Premium Cashews",
    price: 799,
    originalPrice: 999,
    rating: 4.8,
    reviews: 189,
    image: "🥜",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Kashmir Walnuts",
    price: 649,
    originalPrice: 799,
    rating: 4.9,
    reviews: 156,
    image: "🧠",
    badge: "New",
  },
  {
    id: 4,
    name: "Mixed Dry Fruits",
    price: 899,
    originalPrice: 1199,
    rating: 4.7,
    reviews: 312,
    image: "🎁",
    badge: "Gift Pack",
  },
  {
    id: 5,
    name: "Organic Dates",
    price: 349,
    originalPrice: 449,
    rating: 4.8,
    reviews: 198,
    image: "🌴",
  },
  {
    id: 6,
    name: "Pistachio Premium",
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 167,
    image: "💚",
    badge: "Premium",
  },
];

const ProductHighlights = () => {
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-white shadow-sm border border-border/50 hover:shadow-md hover:border-accent/30 transition-all duration-300">
                {/* Badge */}
                {product.badge && (
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold">
                    {product.badge}
                  </Badge>
                )}

                {/* Product Image */}
                <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-soft-cream transition-colors">
                  <motion.span
                    className="text-7xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {product.image}
                  </motion.span>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium text-primary">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-serif font-semibold text-primary group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <Badge variant="secondary" className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border-none">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button className="w-full mt-4 bg-primary text-white hover:bg-green-800">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Categories Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <h3 className="text-xl font-serif font-semibold mb-6 text-center text-primary">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Daily Essentials", emoji: "🥜", count: 24 },
              { name: "Gift Hampers", emoji: "🎁", count: 12 },
              { name: "Premium Combos", emoji: "✨", count: 15 },
              { name: "Festive Specials", emoji: "🎉", count: 10 },
            ].map((category) => (
              <motion.div
                key={category.name}
                whileHover={{ y: -3 }}
                className="cursor-pointer"
              >
                <Link
                  to="/shop"
                  className="block p-4 rounded-xl bg-white shadow-sm border border-border/50 hover:shadow-md hover:border-accent/40 text-center transition-all duration-300"
                >
                  <span className="text-3xl mb-2 block">{category.emoji}</span>
                  <p className="font-medium text-sm text-primary">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductHighlights;
