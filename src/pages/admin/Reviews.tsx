import { useState } from "react";
import {
    Search,
    Check,
    X,
    Trash2,
    MoreHorizontal,
    Loader2,
    MessageSquare,
    Plus,
    Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminReviews, useAdminProducts } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";

interface ReviewFormData {
    product_id: string;
    rating: number;
    title: string;
    comment: string;
    is_approved: boolean;
}

const initialFormData: ReviewFormData = {
    product_id: "",
    rating: 5,
    title: "",
    comment: "",
    is_approved: true,
};

const AdminReviews = () => {
    const { data: reviews, isLoading } = useAdminReviews();
    const { data: products } = useAdminProducts();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user } = useAuthContext();

    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<ReviewFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredReviews = reviews?.filter(
        (review) =>
            review.products?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.user_profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from("reviews")
                .update({ is_approved: !currentStatus })
                .eq("id", id);

            if (error) throw error;

            toast({ title: `Review ${!currentStatus ? "approved" : "unapproved"}` });
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const { error } = await supabase
                .from("reviews")
                .delete()
                .eq("id", deleteId);

            if (error) throw error;
            toast({ title: "Review deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("reviews").insert({
                ...formData,
                user_id: user.id, // Admin posts as themselves
                is_verified_purchase: false, // Admin reviews aren't verified purchases usually
            });

            if (error) throw error;

            toast({ title: "Review added successfully" });
            queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
            setIsDialogOpen(false);
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Reviews</h1>
                    <p className="text-muted-foreground">
                        Manage customer reviews ({reviews?.length || 0})
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reviews by product, user, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Review</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReviews?.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">
                                            {review.products?.name || "Unknown Product"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {review.user_profile?.avatar_url && (
                                                    <img
                                                        src={review.user_profile.avatar_url}
                                                        alt="Avatar"
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                )}
                                                <span>{review.user_profile?.full_name || "Anonymous"}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{review.user_profile?.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-yellow-500">
                                                <span className="font-bold mr-1">{review.rating}</span>
                                                <Star className="h-3 w-3 fill-current" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="font-medium truncate">{review.title}</div>
                                            <div className="text-sm text-muted-foreground truncate">{review.comment}</div>
                                        </TableCell>
                                        <TableCell>
                                            {review.is_approved ? (
                                                <Badge variant="default" className="bg-green-600">Approved</Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(review.id, review.is_approved || false)}>
                                                        {review.is_approved ? (
                                                            <>
                                                                <X className="h-4 w-4 mr-2" />
                                                                Unapprove
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="h-4 w-4 mr-2" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(review.id)}
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
                    )}
                </CardContent>
            </Card>

            {/* Add Review Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Admin Review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Product</Label>
                            <Select
                                value={formData.product_id}
                                onValueChange={(val) => setFormData({ ...formData, product_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Rating</Label>
                            <Select
                                value={formData.rating.toString()}
                                onValueChange={(val) => setFormData({ ...formData, rating: parseInt(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Great product!"
                                required
                            />
                        </div>
                        <div>
                            <Label>Comment</Label>
                            <Textarea
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Detailed review..."
                                required
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Add Review
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
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

export default AdminReviews;
