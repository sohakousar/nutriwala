import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Category, ProductFilters as Filters } from "@/hooks/useProducts";

interface ProductFiltersProps {
  categories: Category[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  totalProducts: number;
}

const HEALTH_BENEFITS = [
  "Brain Health",
  "Heart Health",
  "Energy Boost",
  "Immunity Boost",
  "Anti-inflammatory",
  "Bone Health",
  "Digestive Health",
  "Eye Health",
  "Skin Health",
  "Protein Rich",
];

const MAX_PRICE = 2000;

const ProductFilters = ({ categories, filters, onFilterChange, totalProducts }: ProductFiltersProps) => {
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || MAX_PRICE]);
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    benefits: false,
  });

  const handleCategoryChange = (slug: string) => {
    onFilterChange({
      ...filters,
      categorySlug: filters.categorySlug === slug ? undefined : slug,
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceCommit = () => {
    onFilterChange({
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < MAX_PRICE ? priceRange[1] : undefined,
    });
  };

  const handleBenefitChange = (benefit: string, checked: boolean) => {
    const currentBenefits = filters.healthBenefits || [];
    const newBenefits = checked
      ? [...currentBenefits, benefit]
      : currentBenefits.filter((b) => b !== benefit);

    onFilterChange({
      ...filters,
      healthBenefits: newBenefits.length > 0 ? newBenefits : undefined,
    });
  };

  const clearFilters = () => {
    setPriceRange([0, MAX_PRICE]);
    onFilterChange({
      sortBy: filters.sortBy,
      search: filters.search,
    });
  };

  const hasActiveFilters =
    filters.categorySlug ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.healthBenefits && filters.healthBenefits.length > 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between pb-4 border-b border-border"
          >
            <span className="text-sm text-muted-foreground">
              {totalProducts} products
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive/80"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      <Collapsible
        open={openSections.categories}
        onOpenChange={(open) => setOpenSections({ ...openSections, categories: open })}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-serif font-semibold text-foreground">Categories</h3>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              openSections.categories && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                filters.categorySlug === category.slug
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <span>{category.name}</span>
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible
        open={openSections.price}
        onOpenChange={(open) => setOpenSections({ ...openSections, price: open })}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-serif font-semibold text-foreground">Price Range</h3>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              openSections.price && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ₹{priceRange[0]}
            </span>
            <span className="text-muted-foreground">to</span>
            <span className="px-3 py-1 bg-muted rounded-md text-foreground">
              ₹{priceRange[1]}
            </span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={MAX_PRICE}
            min={0}
            step={50}
            className="w-full"
          />
          <Button
            onClick={handlePriceCommit}
            className="w-full mt-3"
            variant="secondary"
          >
            Apply Price Filter
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Health Benefits */}
      <Collapsible
        open={openSections.benefits}
        onOpenChange={(open) => setOpenSections({ ...openSections, benefits: open })}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-serif font-semibold text-foreground">Health Benefits</h3>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              openSections.benefits && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-2">
          {HEALTH_BENEFITS.map((benefit) => (
            <label
              key={benefit}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={filters.healthBenefits?.includes(benefit) || false}
                onCheckedChange={(checked) => handleBenefitChange(benefit, checked as boolean)}
              />
              <span className="text-sm text-foreground">{benefit}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div >
  );

  // The parent (Shop.tsx) handles the mobile Sheet wrapper,
  // so this component just renders the filter content directly
  return <FilterContent />;
};

export default ProductFilters;
