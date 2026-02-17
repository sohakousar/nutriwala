import { useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, Package } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import ProductSort from "@/components/shop/ProductSort";
import SearchBar from "@/components/shop/SearchBar";
import { useProducts, useCategory, type ProductFilters as Filters } from "@/hooks/useProducts";

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: category, isLoading: categoryLoading } = useCategory(slug || "");

  const filters: Filters = useMemo(() => ({
    categorySlug: slug,
    search: searchParams.get("search") || undefined,
    sortBy: (searchParams.get("sort") as Filters["sortBy"]) || "featured",
  }), [slug, searchParams]);

  const { data: products, isLoading: productsLoading } = useProducts(filters);

  const updateFilters = (newFilters: Partial<Filters>) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.sortBy && newFilters.sortBy !== "featured") params.set("sort", newFilters.sortBy);
    setSearchParams(params);
  };

  const handleSearchChange = (search: string) => {
    updateFilters({ ...filters, search: search || undefined });
  };

  const handleSortChange = (sortBy: Filters["sortBy"]) => {
    updateFilters({ ...filters, sortBy });
  };

  if (categoryLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4 text-foreground">Category not found</h1>
          <Link to="/shop">
            <button className="text-accent hover:underline">Back to Shop</button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Category hero images
  const categoryImages: Record<string, string> = {
    "daily-essentials": "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=1920&h=600&fit=crop",
    "subscription-packs": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1920&h=600&fit=crop",
    "gifting-hampers": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=1920&h=600&fit=crop",
    "premium-combos": "https://images.unsplash.com/photo-1563412885-139e4045d8a4?w=1920&h=600&fit=crop",
    "festive-specials": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1920&h=600&fit=crop",
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${categoryImages[slug || ""] || categoryImages["daily-essentials"]})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/shop" className="text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Shop
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={filters.search || ""}
                onChange={handleSearchChange}
                placeholder={`Search in ${category.name}...`}
              />
            </div>
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground">
                {productsLoading ? (
                  "Loading..."
                ) : (
                  <><span className="font-semibold text-foreground">{products?.length || 0}</span> products</>
                )}
              </p>
              <ProductSort
                sortBy={filters.sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any products in this category matching your search.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Category;
