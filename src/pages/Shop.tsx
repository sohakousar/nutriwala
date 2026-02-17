import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Loader2, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import ProductCard from "@/components/shop/ProductCard";
import ProductFilters from "@/components/shop/ProductFilters";
import ProductSort from "@/components/shop/ProductSort";
import SearchBar from "@/components/shop/SearchBar";
import { useProducts, useCategories, type ProductFilters as Filters } from "@/hooks/useProducts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filters = useMemo(() => ({
    categorySlug: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    healthBenefits: searchParams.get("benefits")?.split(",").filter(Boolean) || undefined,
    sortBy: (searchParams.get("sort") as Filters["sortBy"]) || "featured",
  }), [searchParams]);

  const { data: products, isLoading: productsLoading } = useProducts(filters);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const updateFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();

    if (newFilters.categorySlug) params.set("category", newFilters.categorySlug);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.minPrice !== undefined) params.set("minPrice", String(newFilters.minPrice));
    if (newFilters.maxPrice !== undefined) params.set("maxPrice", String(newFilters.maxPrice));
    if (newFilters.healthBenefits?.length) params.set("benefits", newFilters.healthBenefits.join(","));
    if (newFilters.sortBy && newFilters.sortBy !== "featured") params.set("sort", newFilters.sortBy);

    setSearchParams(params);
  };

  const handleSearchChange = (search: string) => {
    updateFilters({ ...filters, search: search || undefined });
  };

  const handleSortChange = (sortBy: Filters["sortBy"]) => {
    updateFilters({ ...filters, sortBy });
  };

  return (
    <Layout>
      <SEO
        title="Shop Premium Dry Fruits"
        description="Browse our collection of premium dry fruits, nuts, and healthy snacks. California almonds, Kashmiri walnuts, Iranian pistachios, and more. Free shipping on orders above ₹499."
        url="/shop"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
        ]}
      />
      {/* Hero Section - Light & Clean */}
      <section className="relative pt-24 sm:pt-32 pb-12 bg-soft-cream">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-primary mb-4">
              Our <span className="text-accent italic">Collection</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4 leading-relaxed">
              Explore our premium selection of dry fruits, nuts, and healthy snacks sourced from the finest origins around the world.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mt-8"
          >
            <div className="mx-auto">
              <SearchBar
                value={filters.search || ""}
                onChange={handleSearchChange}
                placeholder="Search for almonds, cashews, dates..."
                className="rounded-full overflow-hidden shadow-md"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50/50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Sheet */}
            <div className="lg:hidden mb-4">
              {/* Mobile Header Row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm text-muted-foreground">
                  {productsLoading ? (
                    "Loading..."
                  ) : (
                    <><span className="font-semibold text-primary">{products?.length || 0}</span> products</>
                  )}
                </p>
                <ProductSort
                  sortBy={filters.sortBy}
                  onSortChange={handleSortChange}
                />
              </div>
              {/* Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12 text-base">
                    <Filter className="h-5 w-5" />
                    <span>Filters</span>
                    {(filters.categorySlug || filters.minPrice || filters.maxPrice || filters.healthBenefits?.length) && (
                      <span className="ml-auto h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 overflow-y-auto">
                  <div className="py-4 border-b mb-4">
                    <h2 className="text-xl font-serif font-bold">Filter Products</h2>
                    <p className="text-sm text-muted-foreground mt-1">{products?.length || 0} products available</p>
                  </div>
                  {categoriesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : (
                    <ProductFilters
                      categories={categories || []}
                      filters={filters}
                      onFilterChange={updateFilters}
                      totalProducts={products?.length || 0}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
                  {categoriesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : (
                    <ProductFilters
                      categories={categories || []}
                      filters={filters}
                      onFilterChange={updateFilters}
                      totalProducts={products?.length || 0}
                    />
                  )}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {/* Desktop Header */}
              <div className="hidden lg:flex bg-white rounded-xl p-4 mb-6 shadow-sm border border-border/50 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {productsLoading ? (
                    "Loading..."
                  ) : (
                    <>Showing <span className="font-semibold text-primary">{products?.length || 0}</span> products</>
                  )}
                </p>
                <ProductSort
                  sortBy={filters.sortBy}
                  onSortChange={handleSortChange}
                />
              </div>

              {/* Products */}
              {productsLoading ? (
                <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 min-h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl flex flex-col items-center justify-center py-24 text-center border border-dashed border-border"
                >
                  <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-serif font-semibold text-primary mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                </motion.div>
              )}
            </main>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
