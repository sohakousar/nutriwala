import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, MapPin, CreditCard, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface OrderItem {
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total: number;
    subtotal: number;
    discount_amount: number;
    shipping_amount: number;
    shipping_address: any;
    created_at: string;
    order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const OrderDetails = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from("orders")
                    .select(`
            *,
            order_items (
              id,
              product_name,
              product_image,
              quantity,
              unit_price,
              total_price
            )
          `)
                    .eq("order_number", orderNumber)
                    .single();

                if (error) throw error;
                setOrder(data);
            } catch (err: any) {
                console.error("Error fetching order:", err);
                setError(err.message || "Failed to load order");
            } finally {
                setIsLoading(false);
            }
        };

        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-6">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-4">
                            We couldn't find an order with this number.
                        </p>
                        <Button onClick={() => navigate("/account")}>
                            View All Orders
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/account")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </div>

                {/* Order Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-2xl">Order #{order.order_number}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={statusColors[order.status] || "bg-muted"}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                    Payment: {order.payment_status}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Order Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.order_items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                                >
                                    {item.product_image && (
                                        <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.product_name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₹{item.total_price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="mt-6 pt-6 border-t space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{order.shipping_amount > 0 ? `₹${order.shipping_amount.toFixed(2)}` : "Free"}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping & Payment Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p className="font-medium">{order.shipping_address?.fullName}</p>
                            <p className="text-muted-foreground">{order.shipping_address?.addressLine1}</p>
                            {order.shipping_address?.addressLine2 && (
                                <p className="text-muted-foreground">{order.shipping_address.addressLine2}</p>
                            )}
                            <p className="text-muted-foreground">
                                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postalCode}
                            </p>
                            <p className="text-muted-foreground">{order.shipping_address?.country}</p>
                            <p className="text-muted-foreground mt-2">Phone: {order.shipping_address?.phone}</p>
                            <p className="text-muted-foreground">Email: {order.shipping_address?.email}</p>
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-medium capitalize">
                                    {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Status</span>
                                <Badge variant="outline" className="capitalize">
                                    {order.payment_status}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-semibold text-lg">₹{order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button variant="outline" asChild className="flex-1">
                        <Link to="/shop">Continue Shopping</Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                        <Link to="/contact">Need Help?</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
