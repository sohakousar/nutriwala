import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserReviews } from "@/hooks/useAccountData";
import { format } from "date-fns";

interface ReviewsTabProps {
  userId: string;
}

const ReviewsTab = ({ userId }: ReviewsTabProps) => {
  const { data: reviews, isLoading } = useUserReviews(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
          <p className="text-muted-foreground text-center">
            Share your thoughts on products you've purchased
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any, index: number) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-soft transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.products?.images?.[0] && (
                    <Link to={`/product/${review.products?.slug}`}>
                      <img
                        src={review.products.images[0]}
                        alt={review.products.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </Link>
                  )}
                  <div>
                    <Link to={`/product/${review.products?.slug}`}>
                      <CardTitle className="text-base hover:text-primary transition-colors">
                        {review.products?.name || "Product"}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-accent text-accent"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {review.is_verified_purchase && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Purchase
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      review.is_approved
                        ? "border-green-500 text-green-600"
                        : "border-yellow-500 text-yellow-600"
                    }
                  >
                    {review.is_approved ? "Published" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {review.title && (
                <h4 className="font-medium text-foreground mb-1">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewsTab;
