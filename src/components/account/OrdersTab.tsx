import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useAccountData";
import { format } from "date-fns";

interface OrdersTabProps {
  userId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersTab = ({ userId }: OrdersTabProps) => {
  const { data: orders, isLoading } = useOrders(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start shopping to see your orders here
          </p>
          <Button asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    Order #{order.order_number}
                  </CardTitle>
                  <Badge className={statusColors[order.status] || "bg-muted"}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length || 0} item(s)
                  </p>
                  <p className="font-semibold text-lg">₹{order.total.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    Payment: {order.payment_status}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/order/${order.order_number}`}>
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Items Preview */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {order.order_items.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-lg px-3 py-2"
                      >
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {item.product_name} × {item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        +{order.order_items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default OrdersTab;
