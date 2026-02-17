import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  Loader2,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminProducts, useAdminCategories } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface NutritionFacts {
  energy: string;
  protein: string;
  total_fat: string;
  carbohydrates: string;
  dietary_fiber: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_subscription_eligible: boolean;
  origin: string;
  weight_grams: number | null;
  images: string[];
  health_benefits: string[];
  nutrition_facts: NutritionFacts;
}

const initialNutritionFacts: NutritionFacts = {
  energy: "",
  protein: "",
  total_fat: "",
  carbohydrates: "",
  dietary_fiber: "",
};

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  price: 0,
  compare_at_price: null,
  category_id: null,
  stock: 0,
  is_active: true,
  is_featured: false,
  is_subscription_eligible: true,
  origin: "",
  weight_grams: null,
  images: [],
  health_benefits: [],
  nutrition_facts: initialNutritionFacts,
};

const AdminProducts = () => {
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useAdminCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    // Parse nutrition facts safely
    let nutritionFacts: NutritionFacts = initialNutritionFacts;
    if (product.nutrition_facts && typeof product.nutrition_facts === 'object') {
      nutritionFacts = {
        ...initialNutritionFacts,
        ...(product.nutrition_facts as any)
      };
    }

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price,
      compare_at_price: product.compare_at_price,
      category_id: product.category_id,
      stock: product.stock || 0,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      is_subscription_eligible: product.is_subscription_eligible ?? true,
      origin: product.origin || "",
      weight_grams: product.weight_grams,
      images: product.images || [],
      health_benefits: product.health_benefits || [],
      nutrition_facts: nutritionFacts,
    });
    setEditingProduct(product.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        // Ensure nutrition_facts is stored as JSON
        nutrition_facts: formData.nutrition_facts as any,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct);

        if (error) throw error;
        toast({ title: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;
        toast({ title: "Product created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProductId);

      if (error) throw error;
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleNutritionChange = (field: keyof NutritionFacts, value: string) => {
    setFormData({
      ...formData,
      nutrition_facts: {
        ...formData.nutrition_facts,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog ({products?.length || 0} products)
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[700px] px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sku || "No SKU"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.categories?.name || "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{product.price}</p>
                            {product.compare_at_price && (
                              <p className="text-sm text-muted-foreground line-through">
                                ₹{product.compare_at_price}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              (product.stock || 0) > 10
                                ? "default"
                                : (product.stock || 0) > 0
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {product.stock || 0} in stock
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {product.is_active ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            {product.is_featured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(product)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteProductId(product.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value || null })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  required
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <Label>Compare at Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.compare_at_price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compare_at_price: parseFloat(e.target.value) || null,
                    })
                  }
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
              </div>
              <div>
                <Label>Weight (grams)</Label>
                <Input
                  type="number"
                  value={formData.weight_grams || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weight_grams: parseInt(e.target.value) || null,
                    })
                  }
                  min={0}
                />
              </div>
              <div className="col-span-2">
                <Label>Short Description</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Brief product summary"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label>Origin</Label>
                <Input
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  placeholder="e.g., Kashmir, Afghanistan"
                />
              </div>
              <div>
                <Label>Image URLs (one per line)</Label>
                <Textarea
                  value={formData.images.join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      images: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  rows={3}
                />
              </div>
              <div className="col-span-2">
                <Label>Health Benefits (comma-separated)</Label>
                <Input
                  value={formData.health_benefits.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      health_benefits: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Rich in protein, Good for heart"
                />
              </div>

              {/* Nutrition Facts Section */}
              <div className="col-span-2 border rounded-lg p-4 space-y-4">
                <Label className="text-base font-semibold">Nutrition Facts (per 100g)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Energy (e.g., 576 kcal)</Label>
                    <Input
                      value={formData.nutrition_facts.energy}
                      onChange={(e) => handleNutritionChange("energy", e.target.value)}
                      placeholder="576 kcal"
                    />
                  </div>
                  <div>
                    <Label>Protein (e.g., 21g)</Label>
                    <Input
                      value={formData.nutrition_facts.protein}
                      onChange={(e) => handleNutritionChange("protein", e.target.value)}
                      placeholder="21g"
                    />
                  </div>
                  <div>
                    <Label>Total Fat (e.g., 49g)</Label>
                    <Input
                      value={formData.nutrition_facts.total_fat}
                      onChange={(e) => handleNutritionChange("total_fat", e.target.value)}
                      placeholder="49g"
                    />
                  </div>
                  <div>
                    <Label>Carbohydrates (e.g., 22g)</Label>
                    <Input
                      value={formData.nutrition_facts.carbohydrates}
                      onChange={(e) => handleNutritionChange("carbohydrates", e.target.value)}
                      placeholder="22g"
                    />
                  </div>
                  <div>
                    <Label>Dietary Fiber (e.g., 12g)</Label>
                    <Input
                      value={formData.nutrition_facts.dietary_fiber}
                      onChange={(e) => handleNutritionChange("dietary_fiber", e.target.value)}
                      placeholder="12g"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label>Featured</Label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
