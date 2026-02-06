import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFilters } from "@/hooks/useProducts";

interface ProductSortProps {
  sortBy: ProductFilters["sortBy"];
  onSortChange: (value: ProductFilters["sortBy"]) => void;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const ProductSort = ({ sortBy, onSortChange }: ProductSortProps) => {
  return (
    <Select value={sortBy || "featured"} onValueChange={(value) => onSortChange(value as ProductFilters["sortBy"])}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProductSort;
